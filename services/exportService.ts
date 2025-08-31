import type { Assignment, Scholar, Procedure, Patient } from '../types';
import { Gender } from '../types';

// This interface helps restructure the data from scholar-centric to patient-centric
interface PatientExportData {
  name: string;
  gender: Gender;
  // Key is scholarId to group procedures by the assigned scholar for a single patient
  assignments: Map<string, { scholar: Scholar; procedures: Procedure[] }>;
}

const buildPatientMap = (assignments: Map<string, Assignment>): Map<string, PatientExportData> => {
    const patientMap = new Map<string, PatientExportData>();

    for (const assignment of assignments.values()) {
        const { scholar, procedures } = assignment;
        for (const assignedProc of procedures) {
            const { patientName, patientGender, procedure } = assignedProc;

            // Initialize patient data if not already present
            if (!patientMap.has(patientName)) {
                patientMap.set(patientName, {
                    name: patientName,
                    gender: patientGender,
                    assignments: new Map(),
                });
            }
            const patientData = patientMap.get(patientName)!;

            // Initialize scholar assignment for this patient if not present
            if (!patientData.assignments.has(scholar.id)) {
                patientData.assignments.set(scholar.id, { scholar, procedures: [] });
            }
            const scholarAssignment = patientData.assignments.get(scholar.id)!;
            scholarAssignment.procedures.push(procedure);
        }
    }
    return patientMap;
}

const formatPatientGroup = (patients: PatientExportData[]): string => {
    if (patients.length === 0) return '';
    
    return patients
        .map((patient, index) => {
            let line = `${index + 1}) ${patient.name} - `;
            
            const scholarProcedureParts = Array.from(patient.assignments.values())
                .map(scholarAssignment => {
                    const procedureNames = scholarAssignment.procedures.map(p => p.name).join(' + ');
                    // Using ** for bold as it's common in markdown (e.g., WhatsApp)
                    return `${procedureNames} **${scholarAssignment.scholar.name}**`;
                });

            line += scholarProcedureParts.join(' + ');
            return line;
        })
        .join('\n');
};

export const generateExportText = (assignments: Map<string, Assignment>): string => {
  const patientMap = buildPatientMap(assignments);
  
  const allPatients = Array.from(patientMap.values());
  const femalePatients = allPatients.filter(p => p.gender === Gender.FEMALE);
  const malePatients = allPatients.filter(p => p.gender === Gender.MALE);

  let output = `♀Females (${femalePatients.length})\n\n`;
  output += formatPatientGroup(femalePatients);
  output += `\n\n♂Male (${malePatients.length})\n\n`;
  output += formatPatientGroup(malePatients);
  
  return output.trim();
};
