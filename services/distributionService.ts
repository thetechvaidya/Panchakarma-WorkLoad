import type { Patient, Scholar, Assignment } from '../types';
import { YEAR_WEIGHTS } from '../constants';

interface PatientWithPoints extends Patient {
    totalPoints: number;
}

const assignPatientToScholar = (patient: PatientWithPoints, assignment: Assignment) => {
    for (const procedure of patient.procedures) {
        assignment.procedures.push({
            patientName: patient.name,
            patientGender: patient.gender,
            procedure: procedure,
        });
        assignment.totalPoints += procedure.points;
    }
};

const findBestScholarForPatient = (
    patient: PatientWithPoints,
    scholars: Scholar[],
    assignments: Map<string, Assignment>
): Scholar | null => {
    let bestScholar: Scholar | null = null;
    let minCost = Infinity;

    for (const scholar of scholars) {
        const assignment = assignments.get(scholar.id)!;

        // Skip if this scholar has already been assigned this patient
        if (assignment.procedures.some(p => p.patientName === patient.name)) {
            continue;
        }

        const GENDER_MISMATCH_PENALTY = 1000;
        const genderCost = scholar.gender === patient.gender ? 0 : GENDER_MISMATCH_PENALTY;
        
        // Cost is the absolute deviation from the target *after* adding the patient.
        const newTotalPoints = assignment.totalPoints + patient.totalPoints;
        const targetDeviationCost = Math.abs(newTotalPoints - assignment.targetPoints);

        const totalCost = genderCost + targetDeviationCost;

        if (totalCost < minCost) {
            minCost = totalCost;
            bestScholar = scholar;
        }
    }
    return bestScholar;
};

export const distributeWorkload = (
  patients: Patient[],
  scholars: Scholar[],
  previousAssignments: Map<string, string> // Map<patientName, scholarName>
): Map<string, Assignment> => {
    const assignments = new Map<string, Assignment>();
    const postedScholars = scholars.filter(s => s.isPosted);

    if (postedScholars.length === 0 || patients.length === 0) return assignments;

    const scholarNameMap = new Map(postedScholars.map(s => [s.name, s]));

    const patientsWithPoints: PatientWithPoints[] = patients
        .filter(p => !p.isAttendant && p.procedures.length > 0)
        .map(p => ({
            ...p,
            totalPoints: p.procedures.reduce((sum, proc) => sum + proc.points, 0)
        }));

    // --- Target Calculation ---
    const totalProcedurePoints = patientsWithPoints.reduce((sum, p) => sum + p.totalPoints, 0);
    const totalWeight = postedScholars.reduce((sum, s) => sum + (YEAR_WEIGHTS[s.year] || 0), 0);

    postedScholars.forEach(s => {
        const scholarWeight = YEAR_WEIGHTS[s.year] || 0;
        const targetPoints = totalWeight > 0 ? (scholarWeight / totalWeight) * totalProcedurePoints : 0;
        assignments.set(s.id, { scholar: s, procedures: [], totalPoints: 0, targetPoints });
    });

    patientsWithPoints.sort((a, b) => b.totalPoints - a.totalPoints);

    const unassignedPatients = new Set<PatientWithPoints>(patientsWithPoints);

    // --- PRIORITY 1: Patient Continuity ---
    // Pre-assign returning patients to their previous scholars.
    for (const patient of patientsWithPoints) {
        const previousScholarName = previousAssignments.get(patient.name);
        if (previousScholarName) {
            const scholar = scholarNameMap.get(previousScholarName);
            if (scholar && scholar.isPosted) {
                const assignment = assignments.get(scholar.id);
                if (assignment) {
                    assignPatientToScholar(patient, assignment);
                    unassignedPatients.delete(patient);
                }
            }
        }
    }
    
    // --- PRIORITY 2: Optimal Distribution for New Patients ---
    const remainingPatients = Array.from(unassignedPatients).sort((a, b) => b.totalPoints - a.totalPoints);

    for (const patient of remainingPatients) {
        const bestScholar = findBestScholarForPatient(patient, postedScholars, assignments);
        
        if (bestScholar) {
            assignPatientToScholar(patient, assignments.get(bestScholar.id)!);
        }
    }

    return assignments;
};