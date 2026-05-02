export interface Mark {
  fa1: string;
  hy: string;
  fa2: string;
  ann: string;
}

export interface StudentResult {
  id: string;
  studentName: string;
  studentClass: string;
  rollNo: string;
  session: string;
  selectedSubjects: string[];
  subjectMarks: Record<string, Mark>;
  gunotsob: string;
  result: {
    pct: string;
    grade: string;
    bd: {
      fa1: number;
      hy: number;
      fa2: number;
      ann: number;
      fa1Max: number;
      hyMax: number;
      fa2Max: number;
      annMax: number;
      fa1W: string;
      hyW: string;
      fa2W: string;
      annW: string;
      gunoW: string;
      gunoPct: number;
    };
  } | null;
  updatedBy: string;
  updatedAt: string;
}

export type Page = 'dashboard' | 'record' | 'results' | 'classwise' | 'history';

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'teacher';
  u: string;
  p: string;
}
