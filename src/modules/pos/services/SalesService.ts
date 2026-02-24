import { get, post } from "@app/core/axios/axios";
import { TResult } from "@app/core/types/TResult";

export interface SaleItemTirePayload {
  tireId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleItemServicePayload {
  serviceId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreateSalePayload {
  userId: number;
  sessionId: number;
  subtotal: number;
  discount: number;
  taxes: number;
  total: number;
  paymentMethod: "EFECTIVO" | "TARJETA" | "TRANSFERENCIA" | "OTRO";
  tires?: SaleItemTirePayload[];
  services?: SaleItemServicePayload[];
}

export interface SaleResponse {
  id: number;
  date: string;
  userId: number;
  subtotal: number;
  total: number;
  status: string;
}

export interface SaleModel {
  id: number;
  date: string;
  userId: number;
  subtotal: number;
  discount: number;
  taxes: number;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    lastName: string;
    username: string;
  };
  tireItems: Array<{
    id: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    tire: {
      id: number;
      sku: string;
      brand: string;
      model: string;
      size: string;
    }
  }>;
  serviceItems: Array<{
    id: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    service: {
      id: number;
      name: string;
      category: string;
    }
  }>;
}

export const createSale = async (
  data: CreateSalePayload
): Promise<TResult<SaleResponse>> => {
  return await post<SaleResponse>("/sales", data);
};

export const getSales = async (
  startDate?: string,
  endDate?: string,
  userId?: number
): Promise<TResult<SaleModel[]>> => {
  const params: any = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (userId) params.userId = userId;
  return await get<SaleModel[]>("/sales", params);
};
