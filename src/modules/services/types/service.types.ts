export interface Service {
  id: number;
  name: string;
  description: string | null;
  basePrice: number;
  isActive: boolean;
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCreate {
  name: string;
  description?: string;
  basePrice: number;
  isActive?: boolean;
  category?: string;
}

export interface ServiceUpdate {
  name?: string;
  description?: string;
  basePrice?: number;
  isActive?: boolean;
  category?: string;
}
