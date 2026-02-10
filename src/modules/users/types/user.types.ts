export enum UserRole {
  ADMIN = "ADMIN",
  COACH = "COACH",
  USER = "USER",
}

export interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  role: UserRole;
  children?: any[]; // For users, we might want to see their children
}

export interface UserCreate {
  name: string;
  lastName: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface UserUpdate {
  name?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}
