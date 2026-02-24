import { get, post } from "@app/core/axios/axios";
import { TResult } from "@app/core/types/TResult";

export interface CashRegisterSession {
  id: number;
  userId: number;
  openDate: string;
  closeDate: string | null;
  initialAmount: number;
  totalSales: number;
  totalExpenses: number;
  difference: number | null;
  status: "ABIERTA" | "CERRADA";
  user?: any;
}

export const getActiveSession = async (
  userId: number
): Promise<TResult<CashRegisterSession>> => {
  return await get<CashRegisterSession>(`/cash-register/active?userId=${userId}`);
};

export const openSession = async (
  userId: number,
  initialAmount: number
): Promise<TResult<CashRegisterSession>> => {
  return await post<CashRegisterSession>("/cash-register/open", {
    userId,
    initialAmount,
  });
};

export const closeSession = async (
  sessionId: number,
  finalAmountExpected: number,
  finalAmountReal: number
): Promise<TResult<CashRegisterSession>> => {
  return await post<CashRegisterSession>(`/cash-register/close/${sessionId}`, {
    finalAmountExpected,
    finalAmountReal,
  });
};
