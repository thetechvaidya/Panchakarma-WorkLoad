import type { Patient, Procedure } from '../types';
import { Gender } from '../types';
import { PROCEDURE_GRADES, SORTED_PROCEDURE_KEYS } from '../constants';

export const parsePatientProcedures = (text: string): Patient[] => {
  const patients: Patient[] = [];
  const lines = text.split('\n');
  
  let currentGender: Gender | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.toLowerCase().startsWith('♀females')) {
      currentGender = Gender.FEMALE;
      continue;
    }
    if (trimmedLine.toLowerCase().startsWith('♂male')) {
      currentGender = Gender.MALE;
      continue;
    }
    if (!currentGender) continue;

    const match = trimmedLine.match(/^(\d+)\)\s*([a-zA-Z\s]+)\s*-\s*(.*)/);
    if (!match) continue;
    
    const [, , name, proceduresText] = match;
    const patientName = name.trim();
    const lowerProceduresText = proceduresText.toLowerCase();

    if (lowerProceduresText.includes('attendant')) {
        patients.push({
            name: patientName,
            gender: currentGender,
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
      name: patientName,
      gender: currentGender,
      procedures: uniqueProcedures,
      isAttendant: false,
    });
  }

  return patients;
};