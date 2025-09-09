





export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
}

export interface Scholar {
  id: string;
  name: string;
  year: 1 | 2 | 3;
  gender: Gender;
  isPosted: boolean;
}

export interface ProcedureGradeInfo {
  grade: 1 | 2 | 3;
  points: number;
  name: string;
  code: string;
}

export interface Procedure {
  id:string;
  name: string;
  grade: 1 | 2 | 3;
  points: number;
  code: string;
}

export interface Patient {
  id: string;
  name: string;
  gender: Gender;
  procedures: Procedure[];
  isAttendant: boolean;
}

export interface AssignedProcedure {
  patientName: string;
  patientGender: Gender;
  procedure: Procedure;
}

export interface Assignment {
  scholar: Scholar;
  procedures: AssignedProcedure[];
  totalPoints: number;
  targetPoints: number;
}

export interface HistoricalAssignmentRecord {
  date: string; // ISO string 'YYYY-MM-DD'
  assignments: Assignment[];
  patients?: Patient[];
  scholars?: Scholar[];
}