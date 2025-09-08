import type { Patient, Procedure } from '../types';
import { Gender } from '../types';
import { PROCEDURE_GRADES, SORTED_PROCEDURE_KEYS } from '../constants';

export const parsePatientProcedures = (text: string, gender: Gender): Patient[] => {
  const patients: Patient[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Improved regex to capture names that may contain non-alphabetic characters like (M)
    // It expects lines to start with a number, like "1) Name - procedures..."
    const match = trimmedLine.match(/^(\d+)\)\s*([^-]+?)\s*-\s*(.*)/);
    if (!match) continue;
    
    const [, , name, proceduresText] = match;
    const patientName = name.trim();
    const lowerProceduresText = proceduresText.toLowerCase();
    const patientId = `patient-${patients.length}-${patientName.replace(/\s/g, '')}`;

    if (lowerProceduresText.includes('attendant')) {
        patients.push({
            id: patientId,
            name: patientName,
            gender: gender,
            procedures: [],
            isAttendant: true
        });
        continue;
    }

    const foundProcedures: Procedure[] = [];
    let remainingText = lowerProceduresText;

    // Use a loop to find multiple instances of procedures
    while(remainingText.length > 0) {
      let foundThisPass = false;
      for (const key of SORTED_PROCEDURE_KEYS) {
        if (remainingText.includes(key)) {
          const info = PROCEDURE_GRADES[key];
          foundProcedures.push({
            id: `${patientName}-${info.name}-${Math.random()}`,
            ...info
          });
          remainingText = remainingText.replace(key, ''); // Remove the found key to avoid re-matching
          foundThisPass = true;
          break; // Restart scan with the longest keys first
        }
      }
      if (!foundThisPass) {
        break; // No more keywords found
      }
    }
    
    // De-duplicate procedures for a single patient
    const uniqueProcedures = Array.from(new Map(foundProcedures.map(p => [p.name, p])).values());

    patients.push({
      id: patientId,
      name: patientName,
      gender: gender,
      procedures: uniqueProcedures,
      isAttendant: false,
    });
  }

  return patients;
};


/**
 * Parses the exported text from a previous day to establish patient-scholar continuity.
 * @param text The string content from the previous day's export.
 * @returns A Map where the key is the patient's name and the value is the assigned scholar's name.
 */
export const parsePreviousAssignments = (text: string): Map<string, string> => {
    const assignments = new Map<string, string>();
    if (!text) return assignments;

    const lines = text.split('\n');
    const assignmentRegex = /^\d+\)\s*([^-]+?)\s*-.*?\*\*(.*?)\*\*/;

    for (const line of lines) {
        const match = line.trim().match(assignmentRegex);
        if (match) {
            const patientName = match[1].trim();
            const scholarName = match[2].trim();
            if (patientName && scholarName) {
                assignments.set(patientName, scholarName);
            }
        }
    }

    return assignments;
};
