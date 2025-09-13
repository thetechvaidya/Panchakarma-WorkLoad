import type { HistoricalAssignmentRecord } from '../types';
import { db } from '../firebaseClient';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';

// Firestore collection name
const DAILY_COLLECTION = 'daily_record';

// Helper to normalize date to YYYY-MM-DD (Firestire doc id scheme)
const dateKey = (date: string | Date): string => {
  if (typeof date === 'string') return date;
  return date.toISOString().split('T')[0] as string;
};

// Shape stored in Firestore (can evolve independently)
interface DailyRecordDoc extends HistoricalAssignmentRecord {
  created_at?: string;
  updated_at?: string;
}

/**
 * Saves the daily workload data to Supabase using direct table operations.
 * Uses upsert to handle both new records and updates to existing ones.
 */
export const saveDailyData = async (
  record: Partial<HistoricalAssignmentRecord> & { date: string }
): Promise<void> => {
  const id = dateKey(record.date);
  const ref = doc(collection(db, DAILY_COLLECTION), id);
  try {
    const now = new Date().toISOString();
    const existing = await getDoc(ref);
    const payload: DailyRecordDoc = {
      date: id,
      scholars: record.scholars || (existing.data()?.scholars ?? []),
      patients: record.patients || (existing.data()?.patients ?? []),
      assignments: record.assignments || (existing.data()?.assignments ?? []),
      created_at: existing.exists() ? existing.data()?.created_at : now,
      updated_at: now
    } as DailyRecordDoc;
    await setDoc(ref, payload, { merge: true });
    console.log(`Successfully saved data for ${record.date}.`);
  } catch (error) {
    console.error('Error in saveDailyData (Firestore):', error);
    throw new Error('Failed to save daily data');
  }
};

/**
 * Retrieves a historical record for a specific date from Supabase.
 * Uses direct table query instead of RPC function for better compatibility.
 */
export const getDailyData = async (date: Date): Promise<HistoricalAssignmentRecord | null> => {
  const id = dateKey(date);
  try {
    const snap = await getDoc(doc(collection(db, DAILY_COLLECTION), id));
    if (!snap.exists()) return null;
    return snap.data() as HistoricalAssignmentRecord;
  } catch (error) {
    console.error(`Failed to retrieve daily data for ${id} from Firestore:`, error);
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
    const startKey = dateKey(sevenDaysAgo);
    // Firestore cannot query by doc id range directly without using FieldPath.documentId()
    const qRef = query(collection(db, DAILY_COLLECTION), orderBy('date', 'desc'));
    const snaps = await getDocs(qRef);
    const results: HistoricalAssignmentRecord[] = [];
    snaps.forEach((s: QueryDocumentSnapshot<DocumentData>) => {
      const data = s.data() as HistoricalAssignmentRecord;
      if (data.date >= startKey) results.push(data);
    });
    return results.sort((a,b)=> a.date < b.date ? 1 : -1);
  } catch (error) {
    console.error('Failed to retrieve weekly history (Firestore):', error);
    throw new Error('Failed to retrieve weekly history');
  }
};

/**
 * Retrieves the most recent assignments for continuity purposes.
 * Uses direct table query to get the latest assignments.
 */
export const getLatestAssignmentsForContinuity = async (): Promise<Map<string, string>> => {
  const continuityMap = new Map<string, string>();
  try {
    const qRef = query(collection(db, DAILY_COLLECTION), orderBy('date', 'desc'));
    const snaps = await getDocs(qRef);
    const recent: HistoricalAssignmentRecord[] = [];
  snaps.forEach((s: QueryDocumentSnapshot<DocumentData>) => { recent.push(s.data() as HistoricalAssignmentRecord); });
    recent.sort((a,b)=> a.date < b.date ? 1 : -1);
    const slice = recent.slice(0, 10);
    for (const record of slice) {
      if (Array.isArray(record.assignments)) {
        for (const assignment of record.assignments) {
          // assignment is Assignment type -> we iterate its procedures
          (assignment.procedures || []).forEach(proc => {
            if (proc.patientName && assignment.scholar?.name) {
              continuityMap.set(proc.patientName, assignment.scholar.name);
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Failed to retrieve latest assignments (Firestore):', error);
  }
  return continuityMap;
};

/**
 * Retrieves historical records for a specific date range.
 * Uses direct table query with date range filtering.
 */
export const getDateRangeHistory = async (startDate: Date, endDate: Date): Promise<HistoricalAssignmentRecord[]> => {
  const startStr = dateKey(startDate);
  const endStr = dateKey(endDate);
  try {
    const qRef = query(collection(db, DAILY_COLLECTION), orderBy('date', 'asc'));
    const snaps = await getDocs(qRef);
    const results: HistoricalAssignmentRecord[] = [];
    snaps.forEach((s: QueryDocumentSnapshot<DocumentData>) => {
      const data = s.data() as HistoricalAssignmentRecord;
      if (data.date >= startStr && data.date <= endStr) results.push(data);
    });
    return results.sort((a,b)=> a.date > b.date ? 1 : -1);
  } catch (error) {
    console.error(`Failed to retrieve date range history ${startStr} - ${endStr} (Firestore):`, error);
    return [];
  }
};

/**
 * Retrieves historical records for a specific month.
 * Uses direct table query with month/year filtering.
 */
export const getMonthlyHistory = async (year: number, month: number): Promise<HistoricalAssignmentRecord[]> => {
  try {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return getDateRangeHistory(start, end);
  } catch (error) {
    console.error(`Failed to retrieve monthly history for ${year}-${month} (Firestore):`, error);
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
    const qRef = query(collection(db, DAILY_COLLECTION), orderBy('date', 'desc'));
    const snaps = await getDocs(qRef);
    const records: HistoricalAssignmentRecord[] = [];
  snaps.forEach((s: QueryDocumentSnapshot<DocumentData>) => records.push(s.data() as HistoricalAssignmentRecord));
    const filtered = records.filter(r => new Date(r.date).getDay() === dayOfWeek).slice(0, limit);
    return filtered;
  } catch (error) {
    console.error(`Failed to retrieve day-wise history for day ${dayOfWeek} (Firestore):`, error);
    return [];
  }
};

/**
 * Retrieves aggregated statistics for a date range.
 * This function relies on an RPC function 'get_date_range_stats' to be created by the user.
 */
export const getDateRangeStats = async (startDate: Date, endDate: Date) => {
  const history = await getDateRangeHistory(startDate, endDate);
  if (history.length === 0) return null;

  const daySet = new Set(history.map(r => r.date));
  const scholarSet = new Set<string>();
  const patientSet = new Set<string>();
  let totalAssignments = 0;
  const assignmentsPerDay: Record<string, number> = {};
  const patientsPerDay: Record<string, number> = {};
  const scholarAssignmentCount: Record<string, number> = {};
  const procedureCount: Record<string, number> = {};

  history.forEach(record => {
    const date = record.date;
    const assignments = record.assignments || [];
    assignmentsPerDay[date] = assignmentsPerDay[date] || 0;
    patientsPerDay[date] = patientsPerDay[date] || 0;
    const dayPatientNames = new Set<string>();

    assignments.forEach(a => {
      if (a.scholar) {
        scholarSet.add(a.scholar.id);
        scholarAssignmentCount[a.scholar.id] = (scholarAssignmentCount[a.scholar.id] || 0) + a.procedures.length;
      }
      a.procedures.forEach(p => {
        totalAssignments++;
        dayPatientNames.add(p.patientName);
        const procName = p.procedure?.name;
        if (procName) procedureCount[procName] = (procedureCount[procName] || 0) + 1;
      });
    });
    dayPatientNames.forEach(name => patientSet.add(name));
    assignmentsPerDay[date] += assignments.reduce((sum,a)=> sum + a.procedures.length, 0);
    patientsPerDay[date] += dayPatientNames.size;
  });

  const avgPatientsPerDay = Object.values(patientsPerDay).reduce((a,b)=>a+b,0)/daySet.size;
  const avgAssignmentsPerDay = Object.values(assignmentsPerDay).reduce((a,b)=>a+b,0)/daySet.size;

  // Most active scholar
  let mostActiveScholar: string | null = null;
  let maxScholarCount = -1;
  Object.entries(scholarAssignmentCount).forEach(([id,count])=>{
    if (count > maxScholarCount) { maxScholarCount = count; mostActiveScholar = id; }
  });

  // We need scholar name; search first record containing scholar id
  let mostActiveScholarName: string | null = null;
  if (mostActiveScholar) {
    for (const record of history) {
      for (const a of record.assignments || []) {
        if (a.scholar.id === mostActiveScholar) { mostActiveScholarName = a.scholar.name; break; }
      }
      if (mostActiveScholarName) break;
    }
  }

  // Most common procedure
  let mostCommonProcedure: string | null = null;
  let maxProcCount = -1;
  Object.entries(procedureCount).forEach(([name,count])=>{
    if (count > maxProcCount) { maxProcCount = count; mostCommonProcedure = name; }
  });

  return {
    total_days: daySet.size,
    total_scholars: scholarSet.size,
    total_patients: patientSet.size,
    total_assignments: totalAssignments,
    avg_patients_per_day: Number(avgPatientsPerDay.toFixed(2)),
    avg_assignments_per_day: Number(avgAssignmentsPerDay.toFixed(2)),
    most_active_scholar: mostActiveScholarName,
    most_common_procedure: mostCommonProcedure
  };
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
            // Removed Supabase SQL function documentation; Firestore implementation handles data directly on client.
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