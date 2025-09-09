import type { Patient, Scholar, Assignment } from '../types';
import { YEAR_WEIGHTS } from '../constants';
import { Gender } from '../types';

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

/**
 * Distributes a given set of patients among a specific group of scholars (of the same gender).
 */
const runDistributionForGroup = (
    groupPatients: PatientWithPoints[],
    groupScholars: Scholar[],
    assignments: Map<string, Assignment>
) => {
    if (groupScholars.length === 0 || groupPatients.length === 0) {
        return;
    }

    const unassignedPatientSet = new Set<PatientWithPoints>(groupPatients);
    
    // Calculate target points based ONLY on the workload for this gender group
    const totalGroupPoints = groupPatients.reduce((sum, p) => sum + p.totalPoints, 0);
    const totalGroupWeight = groupScholars.reduce((sum, s) => sum + (YEAR_WEIGHTS[s.year] || 0), 0);

    const groupTargets = new Map<string, number>();
     groupScholars.forEach(s => {
        const scholarWeight = YEAR_WEIGHTS[s.year] || 0;
        const assignment = assignments.get(s.id)!;
        // The target for distribution is relative to the *new* work being assigned in this group
        const targetForNewWork = totalGroupWeight > 0 ? (scholarWeight / totalGroupWeight) * totalGroupPoints : 0;
        groupTargets.set(s.id, assignment.totalPoints + targetForNewWork);
    });


    while (unassignedPatientSet.size > 0) {
        let neediestScholar: Scholar | null = null;
        let minNeediness = Infinity;

        // 1. Find the neediest scholar in this group
        for (const scholar of groupScholars) {
            const assignment = assignments.get(scholar.id)!;
            const target = groupTargets.get(scholar.id)!;
            const neediness = target > 0 ? assignment.totalPoints / target : Infinity;
            if (neediness < minNeediness) {
                minNeediness = neediness;
                neediestScholar = scholar;
            }
        }
        
        if (!neediestScholar) break; 

        // 2. Find the best patient for this scholar from the group
        let bestPatientForScholar: PatientWithPoints | null = null;
        let minCost = Infinity;
        const scholarAssignment = assignments.get(neediestScholar.id)!;
        const scholarTarget = groupTargets.get(neediestScholar.id)!;

        for (const patient of unassignedPatientSet) {
            const newTotalPoints = scholarAssignment.totalPoints + patient.totalPoints;
            const deviation = newTotalPoints - scholarTarget;
            const cost = deviation > 0 ? deviation * 1.5 : Math.abs(deviation);

            if (cost < minCost) {
                minCost = cost;
                bestPatientForScholar = patient;
            }
        }
        
        // 3. Assign the best-fit patient
        if (bestPatientForScholar) {
            assignPatientToScholar(bestPatientForScholar, scholarAssignment);
            unassignedPatientSet.delete(bestPatientForScholar);
        } else {
            break;
        }
    }
};

export const distributeWorkload = (
  patients: Patient[],
  scholars: Scholar[],
  previousAssignments: Map<string, string> // Map<patientName, scholarName>
): Map<string, Assignment> => {
    const assignments = new Map<string, Assignment>();
    const postedScholars = scholars.filter(s => s.isPosted);

    // Initialize assignments map for all posted scholars
    postedScholars.forEach(s => {
        assignments.set(s.id, { scholar: s, procedures: [], totalPoints: 0, targetPoints: 0 });
    });

    if (postedScholars.length === 0 || patients.length === 0) return assignments;

    const scholarNameMap = new Map(postedScholars.map(s => [s.name, s]));

    const patientsWithPoints: PatientWithPoints[] = patients
        .filter(p => !p.isAttendant && p.procedures.length > 0)
        .map(p => ({
            ...p,
            totalPoints: p.procedures.reduce((sum, proc) => sum + proc.points, 0)
        }));

    const unassignedPatients = new Set<PatientWithPoints>(patientsWithPoints);

    // --- PRIORITY 1: Patient Continuity (runs on the whole group) ---
    for (const patient of patientsWithPoints) {
        const previousScholarName = previousAssignments.get(patient.name);
        if (previousScholarName) {
            const scholar = scholarNameMap.get(previousScholarName);
            // Ensure the previous scholar is posted and respects gender rule
            if (scholar && scholar.isPosted && scholar.gender === patient.gender) {
                const assignment = assignments.get(scholar.id);
                if (assignment) {
                    assignPatientToScholar(patient, assignment);
                    unassignedPatients.delete(patient);
                }
            }
        }
    }
    
    // --- PRIORITY 2: Equity-First Distribution with cross-gender fallback ---
    const remainingPatientsAfterContinuity = Array.from(unassignedPatients);

    // Pass 1: Strict Gender Matching
    const femalePatients = remainingPatientsAfterContinuity.filter(p => p.gender === Gender.FEMALE);
    const malePatients = remainingPatientsAfterContinuity.filter(p => p.gender === Gender.MALE);

    const femaleScholars = postedScholars.filter(s => s.gender === Gender.FEMALE);
    const maleScholars = postedScholars.filter(s => s.gender === Gender.MALE);

    // Run distribution for each gender group independently
    runDistributionForGroup(femalePatients, femaleScholars, assignments);
    runDistributionForGroup(malePatients, maleScholars, assignments);

    // Pass 2: Cross-Gender Fallback for any remaining unassigned patients
    const allAssignedPatientNames = new Set<string>();
    assignments.forEach(assignment => {
        assignment.procedures.forEach(p => allAssignedPatientNames.add(p.patientName));
    });

    const stillUnassignedPatients = remainingPatientsAfterContinuity.filter(
        p => !allAssignedPatientNames.has(p.name)
    );
    
    if (stillUnassignedPatients.length > 0) {
        // Distribute remaining patients among ALL posted scholars
        runDistributionForGroup(stillUnassignedPatients, postedScholars, assignments);
    }

    // Finally, calculate the overall target points for each scholar for UI display purposes
    const totalProcedurePoints = patientsWithPoints.reduce((sum, p) => sum + p.totalPoints, 0);
    const totalWeight = postedScholars.reduce((sum, s) => sum + (YEAR_WEIGHTS[s.year] || 0), 0);

    postedScholars.forEach(s => {
        const assignment = assignments.get(s.id)!;
        const scholarWeight = YEAR_WEIGHTS[s.year] || 0;
        const targetPoints = totalWeight > 0 ? (scholarWeight / totalWeight) * totalProcedurePoints : 0;
        assignment.targetPoints = targetPoints;
    });

    return assignments;
};