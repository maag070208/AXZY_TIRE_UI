export interface Location {
  id: number;
  name: string;
  description: string | null;
  aisle: string | null;
  level: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LocationCreate {
  name: string;
  description?: string;
  aisle?: string;
  level?: string;
  isActive?: boolean;
}

export interface LocationUpdate {
  name?: string;
  description?: string;
  aisle?: string;
  level?: string;
  isActive?: boolean;
}
