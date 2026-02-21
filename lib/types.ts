export type Role = 'ADMIN' | 'MEMBER';
export type TaskStatus = 'PLANNED' | 'INPROGRESS' | 'DONE' | 'BLOCKED';
export type Severity = 'LOW' | 'MED' | 'HIGH';
export type BlockerStatus = 'OPEN' | 'RESOLVED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  color: string;
  createdAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  date: string;
  assigneeId: string;
  assignee?: Pick<User, 'id' | 'name' | 'color'>;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Blocker {
  id: string;
  text: string;
  severity: Severity;
  needsHelpFrom?: string;
  status: BlockerStatus;
  date: string;
  userId: string;
  user?: Pick<User, 'id' | 'name' | 'color'>;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  color: string;
}
