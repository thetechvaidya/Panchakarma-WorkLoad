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
