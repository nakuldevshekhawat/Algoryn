import interviewxDSA from './interviewX/interviewx-dsa.json';
import interviewxOS from './interviewX/interviewx-os.json';
import interviewxCN from './interviewX/interviewx-cn.json';
import interviewxDBMS from './interviewX/interviewx-dbms.json';
import interviewxLLD from './interviewX/interviewx-lld.json';

export type InterviewXSubjectId = 'dsa' | 'os' | 'cn' | 'dbms' | 'lld';

export interface InterviewXSubjectConfig {
  id: InterviewXSubjectId;
  name: string;
  data: any;
}

export const interviewXSubjects: Record<string, InterviewXSubjectConfig> = {
  dsa: {
    id: 'dsa',
    name: 'DSA',
    data: interviewxDSA
  },
  os: {
    id: 'os',
    name: 'OS',
    data: interviewxOS
  },
  cn: {
    id: 'cn',
    name: 'CN',
    data: interviewxCN
  },
  dbms: {
    id: 'dbms',
    name: 'DBMS',
    data: interviewxDBMS
  },
  lld: {
    id: 'lld',
    name: 'LLD',
    data: interviewxLLD
  }
};
