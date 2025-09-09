import type { HistoricalAssignmentRecord } from '../types';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

const HISTORY_DAYS = 7; 

// Utility to get date string in YYYY-MM-DD format
const getISODateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getWeeklyHistory = async (): Promise<HistoricalAssignmentRecord[]> => {
    if (!db) return [];

    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - (HISTORY_DAYS - 1));
        sevenDaysAgo.setHours(0, 0, 0, 0);
        const sevenDaysAgoStr = getISODateString(sevenDaysAgo);

        const historyCollection = collection(db, 'daily_data');
        const q = query(
            historyCollection,
            where('date', '>=', sevenDaysAgoStr),
            orderBy('date', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const history: HistoricalAssignmentRecord[] = [];
        querySnapshot.forEach((doc) => {
            history.push(doc.data() as HistoricalAssignmentRecord);
        });
        
        return history;
    } catch (error) {
        console.error("Failed to retrieve assignment history from Firestore:", error);
        return [];
    }
};

export const getLatestAssignmentsForContinuity = async (): Promise<Map<string, string>> => {
    const continuityMap = new Map<string, string>();
    if (!db) return continuityMap;

    try {
        const today = new Date();
        const todayStr = getISODateString(today);

        const historyCollection = collection(db, 'daily_data');
        const q = query(
            historyCollection,
            where('date', '<', todayStr), // Get records before today
            orderBy('date', 'desc'),
            limit(1) // We only need the most recent one
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const latestRecord = querySnapshot.docs[0].data() as HistoricalAssignmentRecord;
            for (const assignment of latestRecord.assignments) {
                for (const procedure of assignment.procedures) {
                    continuityMap.set(procedure.patientName, assignment.scholar.name);
                }
            }
        }
    } catch (error) {
        console.error("Failed to retrieve latest assignments for continuity:", error);
    }
    
    return continuityMap;
};
