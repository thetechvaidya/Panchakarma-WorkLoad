import type { HistoricalAssignmentRecord } from '../types';
import { supabase } from '../supabaseClient';

/**
 * Saves the daily workload data to Supabase using direct table operations.
 * Uses upsert to handle both new records and updates to existing ones.
 */
export const saveDailyData = async (
  record: Partial<HistoricalAssignmentRecord> & { date: string }
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('daily_record')
      .upsert({
        date: record.date,
        scholars: record.scholars || [],
        patients: record.patients || [],
        assignments: record.assignments || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'date'
      });

    if (error) {
      console.error('Supabase error:', error);
      const errorMessage = error.message || 'Unknown database error';
      throw new Error(`Failed to save daily data: ${errorMessage}`);
    }

    console.log(`Successfully saved data for ${record.date}.`);
  } catch (error) {
    console.error("Error in saveDailyData:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while saving data');
  }
};

/**
 * Retrieves a historical record for a specific date from Supabase.
 * Uses direct table query instead of RPC function for better compatibility.
 */
export const getDailyData = async (date: Date): Promise<HistoricalAssignmentRecord | null> => {
  const dateStr = date.toISOString().split('T')[0];
  try {
    const { data, error } = await supabase
      .from('daily_record')
      .select('*')
      .eq('date', dateStr)
      .single();

    if (error) {
      // PGRST116 is the code for 'single row not found', which is expected when no data exists
      if (error.code === 'PGRST116') return null;
      console.error(`Failed to retrieve daily data for ${dateStr} from Supabase:`, error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    return data as HistoricalAssignmentRecord;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Database error:')) {
      throw error;
    }
    console.error(`Failed to retrieve daily data for ${dateStr} from Supabase:`, error);
    return null;
  }
};

/**
 * Retrieves the last 7 days of historical records from Supabase.
 * Uses direct table query with date filtering.
 */
export const getWeeklyHistory = async (): Promise<HistoricalAssignmentRecord[]> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data, error } = await supabase
      .from('daily_record')
      .select('*')
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });
    
    if (error) {
      console.error("Failed to retrieve weekly history from Supabase:", error);
      throw new Error(`Failed to retrieve weekly history: ${error.message}`);
    }
    return data || [];
  } catch (error) {
    if (error instanceof Error && error.message.includes('Failed to retrieve weekly history:')) {
      throw error;
    }
    console.error("Failed to retrieve weekly history from Supabase:", error);
    throw new Error('An unexpected error occurred while retrieving weekly history');
  }
};

/**
 * Retrieves the most recent assignments for continuity purposes.
 * Uses direct table query to get the latest assignments.
 */
export const getLatestAssignmentsForContinuity = async (): Promise<Map<string, string>> => {
  const continuityMap = new Map<string, string>();
  try {
    const { data, error } = await supabase
      .from('daily_record')
      .select('assignments, date')
      .order('date', { ascending: false })
      .limit(10);

    if (error) {
      console.error("Failed to retrieve latest assignments from Supabase:", error);
      return continuityMap;
    }

    if (data) {
      for (const record of data) {
        if (record.assignments && Array.isArray(record.assignments)) {
          for (const assignment of record.assignments) {
            if (assignment.patientName && assignment.scholarName) {
              continuityMap.set(assignment.patientName, assignment.scholarName);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to retrieve latest assignments from Supabase:", error);
  }

  return continuityMap;
};

/**
 * Retrieves historical records for a specific date range.
 * Uses direct table query with date range filtering.
 */
export const getDateRangeHistory = async (startDate: Date, endDate: Date): Promise<HistoricalAssignmentRecord[]> => {
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  try {
    const { data, error } = await supabase
      .from('daily_record')
      .select('*')
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: true });
    
    if (error) {
      console.error(`Failed to retrieve date range history from ${startDateStr} to ${endDateStr}:`, error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error(`Failed to retrieve date range history from ${startDateStr} to ${endDateStr}:`, error);
    return [];
  }
};

/**
 * Retrieves historical records for a specific month.
 * Uses direct table query with month/year filtering.
 */
export const getMonthlyHistory = async (year: number, month: number): Promise<HistoricalAssignmentRecord[]> => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const { data, error } = await supabase
      .from('daily_record')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });
    
    if (error) {
      console.error(`Failed to retrieve monthly history for ${year}-${month}:`, error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error(`Failed to retrieve monthly history for ${year}-${month}:`, error);
    return [];
  }
};

/**
 * Retrieves historical records for the current month.
 */
export const getCurrentMonthHistory = async (): Promise<HistoricalAssignmentRecord[]> => {
  const now = new Date();
  return getMonthlyHistory(now.getFullYear(), now.getMonth() + 1);
};

/**
 * Retrieves historical records for a specific day across multiple months/years.
 * Uses direct table query with day filtering on the client side.
 */
export const getDayWiseHistory = async (dayOfWeek: number, limit: number = 30): Promise<HistoricalAssignmentRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('daily_record')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit * 7); // Get more records to filter by day
    
    if (error) {
      console.error(`Failed to retrieve day-wise history for day ${dayOfWeek}:`, error);
      return [];
    }
    
    // Filter by day of week on client side
    const filtered = (data || []).filter(record => {
      const date = new Date(record.date);
      return date.getDay() === dayOfWeek;
    }).slice(0, limit);
    
    return filtered;
  } catch (error) {
    console.error(`Failed to retrieve day-wise history for day ${dayOfWeek}:`, error);
    return [];
  }
};

/**
 * Retrieves aggregated statistics for a date range.
 * This function relies on an RPC function 'get_date_range_stats' to be created by the user.
 */
export const getDateRangeStats = async (startDate: Date, endDate: Date) => {
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  try {
    const { data, error } = await supabase.rpc('get_date_range_stats', {
      p_start_date: startDateStr,
      p_end_date: endDateStr
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Failed to retrieve stats for date range ${startDateStr} to ${endDateStr}:`, error);
    return null;
  }
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

-- 5. Function to get date range history
CREATE OR REPLACE FUNCTION get_date_range_history(p_start_date DATE, p_end_date DATE)
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
                SELECT DISTINCT date FROM daily_scholar_states WHERE date BETWEEN p_start_date AND p_end_date
            ) d
        ) AS daily_records
    );
END;
$$ LANGUAGE plpgsql;

-- 6. Function to get monthly history
CREATE OR REPLACE FUNCTION get_monthly_history(p_year INT, p_month INT)
RETURNS JSONB AS $$
DECLARE
    start_date DATE;
    end_date DATE;
BEGIN
    start_date := make_date(p_year, p_month, 1);
    end_date := (start_date + INTERVAL '1 month - 1 day')::DATE;
    
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
                SELECT DISTINCT date FROM daily_scholar_states WHERE date BETWEEN start_date AND end_date
            ) d
        ) AS daily_records
    );
END;
$$ LANGUAGE plpgsql;

-- 7. Function to get day-wise history (specific day of week)
CREATE OR REPLACE FUNCTION get_day_wise_history(p_day_of_week INT, p_limit INT DEFAULT 30)
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
                SELECT DISTINCT date FROM daily_scholar_states 
                WHERE EXTRACT(DOW FROM date) = p_day_of_week
                ORDER BY date DESC
                LIMIT p_limit
            ) d
        ) AS daily_records
    );
END;
$$ LANGUAGE plpgsql;

-- 8. Function to get date range statistics
CREATE OR REPLACE FUNCTION get_date_range_stats(p_start_date DATE, p_end_date DATE)
RETURNS JSONB AS $$
BEGIN
    RETURN (
        SELECT jsonb_build_object(
            'total_days', COUNT(DISTINCT dss.date),
            'total_scholars', COUNT(DISTINCT dss.scholar_id),
            'total_patients', COUNT(DISTINCT dps.patient_id),
            'total_assignments', COUNT(DISTINCT a.id),
            'avg_patients_per_day', ROUND(AVG(daily_patients.patient_count), 2),
            'avg_assignments_per_day', ROUND(AVG(daily_assignments.assignment_count), 2),
            'most_active_scholar', (
                SELECT s.name FROM scholars s
                JOIN assignments a ON s.id = a.scholar_id
                WHERE a.date BETWEEN p_start_date AND p_end_date
                GROUP BY s.id, s.name
                ORDER BY COUNT(*) DESC
                LIMIT 1
            ),
            'most_common_procedure', (
                SELECT proc.name FROM procedures proc
                JOIN assignments a ON proc.id = a.procedure_id
                WHERE a.date BETWEEN p_start_date AND p_end_date
                GROUP BY proc.id, proc.name
                ORDER BY COUNT(*) DESC
                LIMIT 1
            )
        )
        FROM daily_scholar_states dss
        FULL OUTER JOIN daily_patient_states dps ON dss.date = dps.date
        FULL OUTER JOIN assignments a ON dss.date = a.date
        LEFT JOIN (
            SELECT date, COUNT(*) as patient_count
            FROM daily_patient_states
            WHERE date BETWEEN p_start_date AND p_end_date
            GROUP BY date
        ) daily_patients ON dss.date = daily_patients.date
        LEFT JOIN (
            SELECT date, COUNT(*) as assignment_count
            FROM assignments
            WHERE date BETWEEN p_start_date AND p_end_date
            GROUP BY date
        ) daily_assignments ON dss.date = daily_assignments.date
        WHERE dss.date BETWEEN p_start_date AND p_end_date
           OR dps.date BETWEEN p_start_date AND p_end_date
           OR a.date BETWEEN p_start_date AND p_end_date
    );
END;
$$ LANGUAGE plpgsql;

*/