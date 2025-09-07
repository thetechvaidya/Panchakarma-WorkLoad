


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
}

export interface Procedure {
  id: string;
  name: string;
  grade: 1 | 2 | 3;
  points: number;
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