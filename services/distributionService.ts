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

    const unassignedPatients = new Set<PatientWithPoints>(patientsWithPoints);

    // --- PRIORITY 1: Patient Continuity ---
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
    
    // --- PRIORITY 2: Equity-First Iterative Distribution ---
    // This new logic replaces the old greedy algorithm.
    // It repeatedly finds the "neediest" scholar and assigns them the best-fitting patient.
    while (unassignedPatients.size > 0) {
        let neediestScholar: Scholar | null = null;
        let minNeediness = Infinity;

        // 1. Find the neediest scholar (one who is furthest below their target)
        for (const scholar of postedScholars) {
            const assignment = assignments.get(scholar.id)!;
            // Use ratio to normalize neediness across different target points
            const neediness = assignment.targetPoints > 0 ? assignment.totalPoints / assignment.targetPoints : Infinity;
            if (neediness < minNeediness) {
                minNeediness = neediness;
                neediestScholar = scholar;
            }
        }

        // If all scholars have met/exceeded their targets or no one is left, break (or handle differently)
        // For now, if we can't find a "needy" one, we'll just pick one to ensure all patients are assigned.
        if (!neediestScholar) {
            // This might happen if all targets are 0 or met. Fallback to the scholar with the least points.
            let scholarWithLeastPoints: Scholar | null = null;
            let minPoints = Infinity;
            for (const scholar of postedScholars) {
                const assignment = assignments.get(scholar.id)!;
                if(assignment.totalPoints < minPoints) {
                    minPoints = assignment.totalPoints;
                    scholarWithLeastPoints = scholar;
                }
            }
            neediestScholar = scholarWithLeastPoints;
        }

        if (!neediestScholar) break; // No scholars to assign to.

        // 2. Find the best patient for THIS scholar from the unassigned pool
        let bestPatientForScholar: PatientWithPoints | null = null;
        let minCost = Infinity;
        const scholarAssignment = assignments.get(neediestScholar.id)!;

        for (const patient of unassignedPatients) {
            // A much lower penalty, making it a preference, not a hard rule.
            const GENDER_MISMATCH_PENALTY = 5; 
            const genderCost = neediestScholar.gender === patient.gender ? 0 : GENDER_MISMATCH_PENALTY;

            const newTotalPoints = scholarAssignment.totalPoints + patient.totalPoints;
            
            // The cost is a combination of how far it pushes from the target and the gender penalty.
            // We slightly penalize going over the target more to avoid large over-allocations.
            const deviation = newTotalPoints - scholarAssignment.targetPoints;
            const pointFitCost = deviation > 0 ? deviation * 1.5 : Math.abs(deviation);
            
            const totalCost = genderCost + pointFitCost;

            if (totalCost < minCost) {
                minCost = totalCost;
                bestPatientForScholar = patient;
            }
        }

        // 3. Assign the best-fit patient to the neediest scholar.
        if (bestPatientForScholar) {
            assignPatientToScholar(bestPatientForScholar, scholarAssignment);
            unassignedPatients.delete(bestPatientForScholar);
        } else {
            // If for some reason no best patient was found (e.g., all patients evaluated to infinity cost),
            // break the loop to prevent an infinite loop. This shouldn't happen with the current logic.
            break;
        }
    }

    return assignments;
};