import { get, put } from "@app/core/axios/axios";
import { TResult } from "@app/core/types/TResult";

export interface SystemSettings {
  id: number;
  businessName: string;
  address: string | null;
  phone: string | null;
  taxRate: number;
  currency: string;
  printerConfig: string | null;
  cashRegisterLimit: number;
  updatedAt: string;
}

export const getSystemSettings = async (): Promise<TResult<SystemSettings>> => {
  return await get<SystemSettings>("/settings");
};

export const updateSystemSettings = async (
  id: number,
  data: Partial<SystemSettings>
): Promise<TResult<SystemSettings>> => {
  return await put<SystemSettings>(`/settings/${id}`, data);
};
