import type { HistoricalAssignmentRecord } from '../types';
import { supabase } from '../supabaseClient';

/**
 * Saves the daily workload data to Supabase using a transactional RPC function.
 * The user must create the 'save_daily_record' function in their Supabase SQL editor.
 * The SQL for this function is provided in comments at the end of this file.
 */
export const saveDailyData = async (
  record: Partial<HistoricalAssignmentRecord> & { date: string }
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('save_daily_record', {
      p_date: record.date,
      p_scholars: record.scholars || [],
      p_patients: record.patients || [],
      p_assignments: record.assignments || [],
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      throw new Error(`Failed to save daily data: ${error.message}`);
    }

    console.log(`Successfully saved data for ${record.date}.`);
  } catch (error) {
    console.error("Error in saveDailyData:", error);
    // The UI can handle this error if needed.
  }
};

/**
 * Retrieves a historical record for a specific date from Supabase.
 * This function relies on an RPC function 'get_daily_record' to be created by the user.
 */
export const getDailyData = async (date: Date): Promise<HistoricalAssignmentRecord | null> => {
  const dateStr = date.toISOString().split('T')[0];
  try {
    const { data, error } = await supabase.rpc('get_daily_record', { p_date: dateStr });

    if (error) {
      // 'PGRST116' is the code for 'single row not found', which is expected when no data exists.
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    // The RPC function should return a single JSON object matching the HistoricalAssignmentRecord structure.
    return data;
  } catch (error) {
    console.error(`Failed to retrieve daily data for ${dateStr} from Supabase:`, error);
    return null;
  }
};

/**
 * Retrieves the last 7 days of historical records from Supabase.
 * This function relies on an RPC function 'get_weekly_history' to be created by the user.
 */
export const getWeeklyHistory = async (): Promise<HistoricalAssignmentRecord[]> => {
  try {
    const { data, error } = await supabase.rpc('get_weekly_history');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Failed to retrieve weekly history from Supabase:", error);
    return [];
  }
};

/**
 * Retrieves the most recent assignments for continuity purposes.
 * This function relies on an RPC function 'get_latest_assignments_for_continuity' to be created by the user.
 */
export const getLatestAssignmentsForContinuity = async (): Promise<Map<string, string>> => {
  const continuityMap = new Map<string, string>();
  try {
    const { data, error } = await supabase.rpc('get_latest_assignments_for_continuity');
    if (error) throw error;

    if (data) {
      for (const item of data) {
        continuityMap.set(item.patient_name, item.scholar_name);
      }
    }
  } catch (error) {
    console.error("Failed to retrieve latest assignments from Supabase:", error);
  }

  return continuityMap;
};

/*
-- =======================================================================
-- SQL for RPC functions to be added in Supabase SQL Editor
-- =======================================================================

-- PLEASE CREATE THESE FUNCTIONS IN YOUR SUPABASE PROJECT'S SQL EDITOR.

-- 1. Function to save the entire daily record
CREATE OR REPLACE FUNCTION save_daily_record(
    p_date DATE,
    p_scholars JSONB,
    p_patients JSONB,
    p_assignments JSONB
)
RETURNS void AS $$
DECLARE
    scholar_record JSONB;
    patient_record JSONB;
    assignment_record JSONB;
    daily_patient_state_id UUID;
    proc JSONB;
    patient_id_map JSONB;
BEGIN
    SELECT jsonb_object_agg(p->>'name', p->>'id') INTO patient_id_map FROM jsonb_array_elements(p_patients) p;

    FOR scholar_record IN SELECT * FROM jsonb_array_elements(p_scholars) LOOP
        INSERT INTO scholars (id, name, year, gender)
        VALUES ((scholar_record->>'id')::UUID, scholar_record->>'name', (scholar_record->>'year')::INT, scholar_record->>'gender')
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, year = EXCLUDED.year, gender = EXCLUDED.gender;

        INSERT INTO daily_scholar_states (date, scholar_id, is_posted)
        VALUES (p_date, (scholar_record->>'id')::UUID, (scholar_record->>'isPosted')::BOOLEAN)
        ON CONFLICT (date, scholar_id) DO UPDATE SET is_posted = EXCLUDED.is_posted;
    END LOOP;

    FOR patient_record IN SELECT * FROM jsonb_array_elements(p_patients) LOOP
        INSERT INTO patients (id, name, gender)
        VALUES ((patient_record->>'id')::UUID, patient_record->>'name', patient_record->>'gender')
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, gender = EXCLUDED.gender;

        INSERT INTO daily_patient_states (date, patient_id, is_attendant)
        VALUES (p_date, (patient_record->>'id')::UUID, (patient_record->>'isAttendant')::BOOLEAN)
        ON CONFLICT (date, patient_id) DO UPDATE SET is_attendant = EXCLUDED.is_attendant
        RETURNING id INTO daily_patient_state_id;

        DELETE FROM daily_patient_procedures WHERE daily_patient_state_id = daily_patient_state_id;

        FOR proc IN SELECT * FROM jsonb_array_elements(patient_record->'procedures') LOOP
            INSERT INTO daily_patient_procedures (daily_patient_state_id, procedure_id)
            VALUES (daily_patient_state_id, (proc->>'id')::UUID);
        END LOOP;
    END LOOP;
    
    FOR assignment_record IN SELECT * FROM jsonb_array_elements(p_assignments) LOOP
        FOR proc IN SELECT * FROM jsonb_array_elements(assignment_record->'procedures') LOOP
             INSERT INTO assignments (date, scholar_id, patient_id, procedure_id)
             VALUES (p_date, (assignment_record->'scholar'->>'id')::UUID, (patient_id_map->>(proc->>'patientName'))::UUID, (proc->'procedure'->>'id')::UUID)
             ON CONFLICT (date, scholar_id, patient_id, procedure_id) DO NOTHING;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;


-- 2. Function to get a full daily record
CREATE OR REPLACE FUNCTION get_daily_record(p_date DATE)
RETURNS JSONB AS $$
BEGIN
    RETURN (
        SELECT jsonb_build_object(
            'date', p_date,
            'scholars', COALESCE((
                SELECT jsonb_agg(s.* || jsonb_build_object('isPosted', dss.is_posted))
                FROM scholars s
                JOIN daily_scholar_states dss ON s.id = dss.scholar_id
                WHERE dss.date = p_date
            ), '[]'::jsonb),
            'patients', COALESCE((
                SELECT jsonb_agg(p_json)
                FROM (
                    SELECT jsonb_build_object(
                        'id', p.id, 'name', p.name, 'gender', p.gender, 'isAttendant', dps.is_attendant,
                        'procedures', COALESCE((
                            SELECT jsonb_agg(proc.*)
                            FROM procedures proc
                            JOIN daily_patient_procedures dpp ON proc.id = dpp.procedure_id
                            WHERE dpp.daily_patient_state_id = dps.id
                        ), '[]'::jsonb)
                    ) as p_json
                    FROM patients p
                    JOIN daily_patient_states dps ON p.id = dps.patient_id
                    WHERE dps.date = p_date
                ) patient_subquery
            ), '[]'::jsonb),
            'assignments', COALESCE((
                SELECT jsonb_agg(agg_assignments)
                FROM (
                    SELECT s.id as scholar_id, jsonb_build_object('scholar', s.*, 'procedures', jsonb_agg(
                        jsonb_build_object('patientName', pat.name, 'patientGender', pat.gender, 'procedure', proc.*)
                    )) as agg_assignments
                    FROM assignments a
                    JOIN scholars s ON a.scholar_id = s.id
                    JOIN patients pat ON a.patient_id = pat.id
                    JOIN procedures proc ON a.procedure_id = proc.id
                    WHERE a.date = p_date
                    GROUP BY s.id
                ) grouped_assignments
            ), '[]'::jsonb)
        )
    );
END;
$$ LANGUAGE plpgsql;


-- 3. Function to get weekly history
-- 3. Function to get weekly history (Optimized)
CREATE OR REPLACE FUNCTION get_weekly_history()
RETURNS JSONB AS $$
BEGIN
    RETURN (
        SELECT jsonb_agg(daily_records ORDER BY date DESC)
        FROM (
            SELECT
                d.date,
                (SELECT jsonb_agg(s.* || jsonb_build_object('isPosted', dss.is_posted)) FROM scholars s JOIN daily_scholar_states dss ON s.id = dss.scholar_id WHERE dss.date = d.date) as scholars,
                (SELECT jsonb_agg(p_json) FROM (
                    SELECT jsonb_build_object('id', p.id, 'name', p.name, 'gender', p.gender, 'isAttendant', dps.is_attendant, 'procedures', COALESCE((SELECT jsonb_agg(proc.*) FROM procedures proc JOIN daily_patient_procedures dpp ON proc.id = dpp.procedure_id WHERE dpp.daily_patient_state_id = dps.id), '[]'::jsonb)) as p_json
                    FROM patients p JOIN daily_patient_states dps ON p.id = dps.patient_id WHERE dps.date = d.date
                ) patient_subquery) as patients,
                (SELECT jsonb_agg(agg_assignments) FROM (
                    SELECT s.id as scholar_id, jsonb_build_object('scholar', s.*, 'procedures', jsonb_agg(jsonb_build_object('patientName', pat.name, 'patientGender', pat.gender, 'procedure', proc.*))) as agg_assignments
                    FROM assignments a
                    JOIN scholars s ON a.scholar_id = s.id
                    JOIN patients pat ON a.patient_id = pat.id
                    JOIN procedures proc ON a.procedure_id = proc.id
                    WHERE a.date = d.date
                    GROUP BY s.id
                ) grouped_assignments) as assignments
            FROM (
                SELECT DISTINCT date FROM daily_scholar_states WHERE date >= (CURRENT_DATE - INTERVAL '6 days')
            ) d
        ) AS daily_records
    );
END;
$$ LANGUAGE plpgsql;


-- 4. Function to get latest assignments for continuity
CREATE OR REPLACE FUNCTION get_latest_assignments_for_continuity()
RETURNS JSONB AS $$
DECLARE
    latest_date DATE;
BEGIN
    SELECT MAX(date) INTO latest_date FROM assignments WHERE date < CURRENT_DATE;
    IF latest_date IS NULL THEN
        RETURN '[]'::JSONB;
    END IF;

    RETURN (
        SELECT jsonb_agg(jsonb_build_object('patient_name', p.name, 'scholar_name', s.name))
        FROM assignments a
        JOIN patients p ON a.patient_id = p.id
        JOIN scholars s ON a.scholar_id = s.id
        WHERE a.date = latest_date
    );
END;
$$ LANGUAGE plpgsql;

*/