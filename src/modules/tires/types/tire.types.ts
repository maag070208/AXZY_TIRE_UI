import { Location } from "../../locations/types/location.types";

export type TireType = "NUEVA" | "SEMINUEVA" | "GALLITO";

export interface Tire {
  id: number;
  brand: string;
  model: string;
  size: string;
  type: TireType;
  cost: number;
  price: number;
  currentStock: number;
  minStock: number;
  sku?: string | null;
  entryDate?: string;
  providerId?: number | null;
  locationId?: number | null;
  createdAt?: string;
  updatedAt?: string;
  
  location?: Location; 
}

export interface TireCreate {
  brand: string;
  model: string;
  size: string;
  type: TireType;
  cost: number;
  price: number;
  currentStock: number;
  minStock?: number;
  sku?: string | null;
  providerId?: number | null;
  locationId?: number | null;
}

export interface TireUpdate {
  brand?: string;
  model?: string;
  size?: string;
  type?: TireType;
  cost?: number;
  price?: number;
  currentStock?: number;
  minStock?: number;
  sku?: string | null;
  providerId?: number | null;
  locationId?: number | null;
}
