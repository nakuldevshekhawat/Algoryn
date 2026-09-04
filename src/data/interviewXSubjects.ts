import interviewxDSA from './interviewX/interviewx-dsa.json';
import interviewxOS from './interviewX/interviewx-os.json';
import interviewxCN from './interviewX/interviewx-cn.json';
import interviewxDBMS from './interviewX/interviewx-dbms.json';
import interviewxLLD from './interviewX/interviewx-lld.json';

import osNotes from './interviewXNotes/osNotes.json';
import cnNotes from './interviewXNotes/cnNotes.json';
import dbmsNotes from './interviewXNotes/dbmsNotes.json';
import dsaNotes from './interviewXNotes/dsaNotes.json';

export type InterviewXSubjectId = 'dsa' | 'os' | 'cn' | 'dbms' | 'lld';

export interface InterviewXSubjectConfig {
  id: InterviewXSubjectId;
  name: string;
  data: any;
  notesData?: any;
}

export const interviewXSubjects: Record<string, InterviewXSubjectConfig> = {
  dsa: {
    id: 'dsa',
    name: 'DSA',
    data: interviewxDSA,
    notesData: dsaNotes
  },
  os: {
    id: 'os',
    name: 'OS',
    data: interviewxOS,
    notesData: osNotes
  },
  cn: {
    id: 'cn',
    name: 'CN',
    data: interviewxCN,
    notesData: cnNotes
  },
  dbms: {
    id: 'dbms',
    name: 'DBMS',
    data: interviewxDBMS,
    notesData: dbmsNotes
  },
  lld: {
    id: 'lld',
    name: 'LLD',
    data: interviewxLLD
  }
};
