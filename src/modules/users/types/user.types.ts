export enum UserRole {
  ADMIN = "ADMIN",
  CAJERO = "CAJERO",
  TECNICO = "TECNICO",
  SUPERVISOR = "SUPERVISOR",
}

export interface User {
  id: number;
  name: string;
  lastName: string;
  username: string;
  role: UserRole;
}

export interface UserCreate {
  name: string;
  lastName: string;
  username: string;
  password?: string;
  role: UserRole;
}

export interface UserUpdate {
  name?: string;
  lastName?: string;
  username?: string;
  password?: string;
  role?: UserRole;
}
