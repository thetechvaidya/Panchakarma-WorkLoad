import type { Patient, Scholar, Assignment, AssignedProcedure } from '../types';
import { Gender } from '../types';
import { WORKLOAD_DISTRIBUTION } from '../constants';

const findBestScholarForPatient = (
  patient: Patient,
  totalSystemPoints: number,
  scholars: Scholar[],
  assignments: Map<string, Assignment>
): Scholar | null => {
  let availableScholars = [...scholars];
  if (availableScholars.length === 0) return null;

  // NEW Rule: Anuvasan Basti must be performed by a scholar of the same gender.
  const hasAnuvasanBasti = patient.procedures.some(
    p => p.name === 'Anuvasan Basti'
  );

  if (hasAnuvasanBasti) {
    availableScholars = availableScholars.filter(s => s.gender === patient.gender);
    if (availableScholars.length === 0) {
      return null; // No available scholars of the required gender
    }
  }

  // OLD rigid rule for NB/AB on males has been removed to improve balance.
  
  // General Rule: distribute based on workload targets
  const scholarsByYear: Record<number, Scholar[]> = { 1: [], 2: [], 3: [] };
  availableScholars.forEach(s => {
    if (!scholarsByYear[s.year]) scholarsByYear[s.year] = [];
    scholarsByYear[s.year].push(s);
  });

  const pointsByYear: Record<number, number> = {
    1: (scholarsByYear[1] || []).reduce(
      (sum, s) => sum + (assignments.get(s.id)?.totalPoints ?? 0),
      0
    ),
    2: (scholarsByYear[2] || []).reduce(
      (sum, s) => sum + (assignments.get(s.id)?.totalPoints ?? 0),
      0
    ),
    3: (scholarsByYear[3] || []).reduce(
      (sum, s) => sum + (assignments.get(s.id)?.totalPoints ?? 0),
      0
    ),
  };

  const deficitByYear = [1, 2, 3]
    .map(year => {
      if (!scholarsByYear[year] || scholarsByYear[year].length === 0)
        return { year, deficit: -Infinity };
      const targetPoints = totalSystemPoints * (WORKLOAD_DISTRIBUTION[year] ?? 0);
      const currentPoints = pointsByYear[year];
      return { year, deficit: targetPoints - currentPoints };
    })
    .sort((a, b) => b.deficit - a.deficit);

  // Find a scholar from the most behind year group, preferring same gender
  for (const { year } of deficitByYear) {
    const scholarsInYear = scholarsByYear[year];
    if (scholarsInYear && scholarsInYear.length > 0) {
      const sameGender = scholarsInYear.filter(s => s.gender === patient.gender);
      const differentGender = scholarsInYear.filter(s => s.gender !== patient.gender);

      sameGender.sort((a, b) => (assignments.get(a.id)?.totalPoints ?? 0) - (assignments.get(b.id)?.totalPoints ?? 0));
      differentGender.sort((a, b) => (assignments.get(a.id)?.totalPoints ?? 0) - (assignments.get(b.id)?.totalPoints ?? 0));
      
      const candidates = [...sameGender, ...differentGender];
      if (candidates.length > 0) {
        return candidates[0];
      }
    }
  }

  // Fallback
  return availableScholars.sort(
    (a, b) =>
      (assignments.get(a.id)?.totalPoints ?? 0) -
      (assignments.get(b.id)?.totalPoints ?? 0)
  )[0];
};

export const distributeWorkload = (
  patients: Patient[],
  scholars: Scholar[]
): Map<string, Assignment> => {
  const assignments = new Map<string, Assignment>();
  scholars.forEach(s => {
    assignments.set(s.id, { scholar: s, procedures: [], totalPoints: 0 });
  });

  const patientWorkloads = patients
    .filter(p => !p.isAttendant && p.procedures.length > 0)
    .map(p => ({
      patient: p,
      totalPoints: p.procedures.reduce((sum, proc) => sum + proc.points, 0),
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  if (patientWorkloads.length === 0) {
    return assignments;
  }

  const totalSystemPoints = patientWorkloads.reduce(
    (sum, item) => sum + item.totalPoints,
    0
  );

  const postedScholars = scholars.filter(s => s.isPosted);
  const nonPostedScholars = scholars.filter(s => !s.isPosted);

  for (const { patient, totalPoints } of patientWorkloads) {
    let bestScholar = findBestScholarForPatient(
      patient,
      totalSystemPoints,
      postedScholars,
      assignments
    );

    if (!bestScholar) {
      bestScholar = findBestScholarForPatient(
        patient,
        totalSystemPoints,
        nonPostedScholars,
        assignments
      );
    }

    if (bestScholar) {
      const assignment = assignments.get(bestScholar.id);
      if (assignment) {
        const proceduresToAssign: AssignedProcedure[] = patient.procedures.map(
          proc => ({
            patientName: patient.name,
            patientGender: patient.gender,
            procedure: proc,
          })
        );
        assignment.procedures.push(...proceduresToAssign);
        assignment.totalPoints += totalPoints;
      }
    }
  }

  return assignments;
};
