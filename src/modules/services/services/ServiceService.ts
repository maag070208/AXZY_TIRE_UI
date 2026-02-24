import { TResult } from "@app/core/types/TResult";
import { get, post, put, remove } from "@app/core/axios/axios";
import { Service, ServiceCreate, ServiceUpdate } from "../types/service.types";

export const getAllServices = async (): Promise<TResult<Service[]>> => {
  return await get<Service[]>("/services");
};

export const getServiceById = async (id: number): Promise<TResult<Service>> => {
  return await get<Service>(`/services/${id}`);
};

export const createService = async (
  data: ServiceCreate
): Promise<TResult<Service>> => {
  return await post<Service>("/services", data);
};

export const updateService = async (
  id: number,
  data: ServiceUpdate
): Promise<TResult<Service>> => {
  return await put<Service>(`/services/${id}`, data);
};

export const deleteService = async (id: number): Promise<TResult<Service>> => {
  return await remove<Service>(`/services/${id}`);
};
