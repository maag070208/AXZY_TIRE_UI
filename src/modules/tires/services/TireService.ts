import { get, post, put, remove } from "@app/core/axios/axios";
import { TResult } from "@app/core/types/TResult";
import { Tire, TireCreate, TireUpdate } from "../types/tire.types";

export const getAllTires = async (): Promise<TResult<Tire[]>> => {
  return await get<Tire[]>("/tires");
};

export const getTireById = async (id: number): Promise<TResult<Tire>> => {
  return await get<Tire>(`/tires/${id}`);
};

export const createTire = async (
  data: TireCreate
): Promise<TResult<Tire>> => {
  return await post<Tire>("/tires", data);
};

export const bulkCreateTires = async (
  data: any[]
): Promise<TResult<any>> => {
  return await post<any>("/tires/bulk", { tires: data });
};

export const updateTire = async (
  id: number,
  data: TireUpdate
): Promise<TResult<Tire>> => {
  return await put<Tire>(`/tires/${id}`, data);
};

export const deleteTire = async (
  id: number
): Promise<TResult<Tire>> => {
  return await remove<Tire>(`/tires/${id}`);
};
