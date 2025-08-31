import type { Patient, Scholar, Assignment } from '../types';
import { BASE_PATIENT_CAPACITY_PER_YEAR, MAX_PATIENT_CAPACITY_PER_YEAR } from '../constants';

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
    assignments: Map<string, Assignment>,
    capacityConfig: Record<number, number>
): Scholar | null => {
    let bestScholar: Scholar | null = null;
    let minCost = Infinity;

    for (const scholar of scholars) {
        const assignment = assignments.get(scholar.id)!;
        const capacity = capacityConfig[scholar.year];
        const patientNames = assignment.procedures.map(p => p.patientName);
        if (patientNames.includes(patient.name)) continue; // Already assigned this patient to this scholar
        
        const currentPatientCount = new Set(patientNames).size;

        if (currentPatientCount >= capacity) {
            continue;
        }

        const GENDER_MISMATCH_PENALTY = 1000;
        const genderCost = scholar.gender === patient.gender ? 0 : GENDER_MISMATCH_PENALTY;
        const workloadCost = assignment.totalPoints;
        const totalCost = genderCost + workloadCost;

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

    postedScholars.forEach(s => {
        assignments.set(s.id, { scholar: s, procedures: [], totalPoints: 0 });
    });

    const patientsWithPoints: PatientWithPoints[] = patients
        .filter(p => !p.isAttendant && p.procedures.length > 0)
        .map(p => ({
            ...p,
            totalPoints: p.procedures.reduce((sum, proc) => sum + proc.points, 0)
        }));

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
    
    const remainingPatients = Array.from(unassignedPatients);

    // --- PRIORITY 2: Fairness-First for New Patients ---

    // --- PHASE 1: Base Allocation for New Patients ---
    for (const patient of remainingPatients) {
        if (!unassignedPatients.has(patient)) continue; 

        const bestScholar = findBestScholarForPatient(patient, postedScholars, assignments, BASE_PATIENT_CAPACITY_PER_YEAR);

        if (bestScholar) {
            assignPatientToScholar(patient, assignments.get(bestScholar.id)!);
            unassignedPatients.delete(patient);
        }
    }

    // --- PHASE 2: Max Allocation for Remaining New Patients ---
    const remainingAfterPhase1 = Array.from(unassignedPatients);
    for (const patient of remainingAfterPhase1) {
        const bestScholar = findBestScholarForPatient(patient, postedScholars, assignments, MAX_PATIENT_CAPACITY_PER_YEAR);
        
        if (bestScholar) {
            assignPatientToScholar(patient, assignments.get(bestScholar.id)!);
            unassignedPatients.delete(patient);
        }
    }

    return assignments;
};