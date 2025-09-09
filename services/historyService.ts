import type { Assignment, HistoricalAssignmentRecord } from '../types';

const STORAGE_KEY = 'panchkarma_assignment_history';
const HISTORY_DAYS = 7; // Keep 7 days of history

// Utility to get date string in YYYY-MM-DD format
const getISODateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const saveDailyAssignments = (assignments: Map<string, Assignment>): void => {
  try {
    const todayStr = getISODateString(new Date());
    const existingHistory: HistoricalAssignmentRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    // Filter out today's record if it already exists to prevent duplicates
    const filteredHistory = existingHistory.filter(record => record.date !== todayStr);

    // Add the new record for today
    const newRecord: HistoricalAssignmentRecord = {
      date: todayStr,
      assignments: Array.from(assignments.values()),
    };
    const updatedHistory = [...filteredHistory, newRecord];

    // Prune history to keep it to the last N days, sorted by date descending
    if (updatedHistory.length > HISTORY_DAYS) {
        updatedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        updatedHistory.splice(HISTORY_DAYS);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error)
 {
    console.error("Failed to save assignment history:", error);
  }
};

export const getWeeklyHistory = (): HistoricalAssignmentRecord[] => {
    try {
        const json = localStorage.getItem(STORAGE_KEY);
        if (!json) return [];
        
        const history: HistoricalAssignmentRecord[] = JSON.parse(json);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - (HISTORY_DAYS - 1));
        sevenDaysAgo.setHours(0, 0, 0, 0);

        return history.filter(record => new Date(record.date) >= sevenDaysAgo);
    } catch (error) {
        console.error("Failed to retrieve assignment history:", error);
        return [];
    }
};