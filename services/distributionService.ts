import type { Patient, Scholar, Assignment } from '../types';
import { YEAR_WEIGHTS } from '../constants';
import { Gender } from '../types';

interface PatientWithPoints extends Patient {
    totalPoints: number;
}

// Performance optimization: Cache for expensive calculations
const calculationCache = new Map<string, any>();

// Utility function to generate cache keys
const getCacheKey = (prefix: string, ...args: any[]): string => {
    return `${prefix}_${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join('_')}`;
};

// Performance monitoring utilities
const performanceMetrics = {
    distributionCalls: 0,
    totalDistributionTime: 0,
    cacheHits: 0,
    cacheMisses: 0
};

export const getPerformanceMetrics = () => ({ ...performanceMetrics });

export const resetPerformanceMetrics = () => {
    performanceMetrics.distributionCalls = 0;
    performanceMetrics.totalDistributionTime = 0;
    performanceMetrics.cacheHits = 0;
    performanceMetrics.cacheMisses = 0;
};

// Clear cache when needed (e.g., when data changes)
export const clearDistributionCache = (): void => {
    calculationCache.clear();
};

const assignPatientToScholar = (patient: PatientWithPoints, assignment: Assignment): void => {
    // Batch assignment for better performance
    const newProcedures = patient.procedures.map(procedure => ({
        patientName: patient.name,
        patientGender: patient.gender,
        procedure: procedure,
    }));
    
    assignment.procedures.push(...newProcedures);
    assignment.totalPoints += patient.totalPoints; // Use pre-calculated total
};

/**
 * Optimized distribution algorithm for a specific group of scholars and patients.
 * Uses improved data structures and caching for better performance.
 */
const runDistributionForGroup = (
    groupPatients: PatientWithPoints[],
    groupScholars: Scholar[],
    assignments: Map<string, Assignment>
): void => {
    if (groupScholars.length === 0 || groupPatients.length === 0) {
        return;
    }

    // Use array for better iteration performance
    const unassignedPatients = [...groupPatients];
    
    // Pre-calculate values for performance
    const totalGroupPoints = groupPatients.reduce((sum, p) => sum + p.totalPoints, 0);
    const totalGroupWeight = groupScholars.reduce((sum, s) => sum + (YEAR_WEIGHTS[s.year] || 0), 0);

    // Use array for faster access patterns
    const scholarData = groupScholars.map(scholar => {
        const scholarWeight = YEAR_WEIGHTS[scholar.year] || 0;
        const assignment = assignments.get(scholar.id)!;
        const targetForNewWork = totalGroupWeight > 0 ? (scholarWeight / totalGroupWeight) * totalGroupPoints : 0;
        return {
            scholar,
            assignment,
            target: assignment.totalPoints + targetForNewWork,
            weight: scholarWeight
        };
    });


    // Optimized assignment loop with better data structures
    let unassignedCount = unassignedPatients.length;
    const assignedIndices = new Set<number>();

    while (unassignedCount > 0) {
        let bestScholarData = null;
        let minNeediness = Infinity;

        // 1. Find the neediest scholar using pre-calculated data
        for (const data of scholarData) {
            const neediness = data.target > 0 ? data.assignment.totalPoints / data.target : Infinity;
            if (neediness < minNeediness) {
                minNeediness = neediness;
                bestScholarData = data;
            }
        }
        
        if (!bestScholarData) break;

        // 2. Find the best patient using indexed access
        let bestPatientIndex = -1;
        let minCost = Infinity;

        for (let i = 0; i < unassignedPatients.length; i++) {
            if (assignedIndices.has(i)) continue;
            
            const patient = unassignedPatients[i];
            const newTotalPoints = bestScholarData.assignment.totalPoints + patient.totalPoints;
            const deviation = newTotalPoints - bestScholarData.target;
            const cost = deviation > 0 ? deviation * 1.5 : Math.abs(deviation);

            if (cost < minCost) {
                minCost = cost;
                bestPatientIndex = i;
            }
        }
        
        // 3. Assign the best-fit patient
        if (bestPatientIndex >= 0) {
            const bestPatient = unassignedPatients[bestPatientIndex];
            assignPatientToScholar(bestPatient, bestScholarData.assignment);
            assignedIndices.add(bestPatientIndex);
            unassignedCount--;
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
    const startTime = performance.now();
    performanceMetrics.distributionCalls++;
    
    // Generate cache key for this distribution
    const cacheKey = getCacheKey('distribute', patients.length, scholars.length, 
        patients.map(p => p.id).sort().join(','), 
        scholars.map(s => s.id).sort().join(','));
    
    // Check cache first
    if (calculationCache.has(cacheKey)) {
        performanceMetrics.cacheHits++;
        return calculationCache.get(cacheKey);
    }
    
    performanceMetrics.cacheMisses++;

    const assignments = new Map<string, Assignment>();
    const postedScholars = scholars.filter(s => s.isPosted);

    // Initialize assignments map for all posted scholars with better performance
    for (const scholar of postedScholars) {
        assignments.set(scholar.id, { scholar: scholar, procedures: [], totalPoints: 0, targetPoints: 0 });
    }

    if (postedScholars.length === 0 || patients.length === 0) return assignments;

    const scholarNameMap = new Map(postedScholars.map(s => [s.name, s]));

    // Pre-calculate total points for each patient (memoized)
    const patientsWithPoints: PatientWithPoints[] = patients
        .filter(p => !p.isAttendant && p.procedures.length > 0)
        .map(p => {
            const pointsCacheKey = getCacheKey('patient_points', p.id, p.procedures.length);
            let totalPoints = calculationCache.get(pointsCacheKey);
            
            if (totalPoints === undefined) {
                totalPoints = p.procedures.reduce((sum, proc) => sum + proc.points, 0);
                calculationCache.set(pointsCacheKey, totalPoints);
            }
            
            return {
                ...p,
                totalPoints
            };
        });

    const unassignedPatients = new Set<PatientWithPoints>(patientsWithPoints);

    // --- PRIORITY 1: Patient Continuity (runs on the whole group) ---
    // Batch process continuity assignments with optimized filtering
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

    // Pass 1: Strict Gender Matching with optimized separation
    const patientsByGender = {
        [Gender.FEMALE]: [] as PatientWithPoints[],
        [Gender.MALE]: [] as PatientWithPoints[]
    };
    
    const scholarsByGender = {
        [Gender.FEMALE]: [] as Scholar[],
        [Gender.MALE]: [] as Scholar[]
    };
    
    // Single pass separation for patients
    for (const patient of remainingPatientsAfterContinuity) {
        if (patient.gender === Gender.FEMALE || patient.gender === Gender.MALE) {
            patientsByGender[patient.gender].push(patient);
        }
    }
    
    // Single pass separation for scholars
    for (const scholar of postedScholars) {
        if (scholar.gender === Gender.FEMALE || scholar.gender === Gender.MALE) {
            scholarsByGender[scholar.gender].push(scholar);
        }
    }

    // Run distribution for each gender group independently with optimized tracking
    const genders = [Gender.FEMALE, Gender.MALE] as const;
    
    for (const gender of genders) {
        runDistributionForGroup(
            patientsByGender[gender], 
            scholarsByGender[gender], 
            assignments
        );
    }

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

    // Finally, calculate the overall target points for each scholar for UI display purposes with memoization
    const totalPointsCacheKey = getCacheKey('total_points', patientsWithPoints.length);
    let totalProcedurePoints = calculationCache.get(totalPointsCacheKey);
    
    if (totalProcedurePoints === undefined) {
        totalProcedurePoints = patientsWithPoints.reduce((sum, p) => sum + p.totalPoints, 0);
        calculationCache.set(totalPointsCacheKey, totalProcedurePoints);
    }
    
    const totalWeightCacheKey = getCacheKey('total_weight', postedScholars.length);
    let totalWeight = calculationCache.get(totalWeightCacheKey);
    
    if (totalWeight === undefined) {
        totalWeight = postedScholars.reduce((sum, s) => sum + (YEAR_WEIGHTS[s.year] || 0), 0);
        calculationCache.set(totalWeightCacheKey, totalWeight);
    }

    for (const scholar of postedScholars) {
        const assignment = assignments.get(scholar.id)!;
        const scholarWeight = YEAR_WEIGHTS[scholar.year] || 0;
        const targetPoints = totalWeight > 0 ? (scholarWeight / totalWeight) * totalProcedurePoints : 0;
        assignment.targetPoints = targetPoints;
    }
    
    // Cache the result
    calculationCache.set(cacheKey, assignments);
    
    // Update performance metrics
    const endTime = performance.now();
    performanceMetrics.totalDistributionTime += (endTime - startTime);
    
    return assignments;
};