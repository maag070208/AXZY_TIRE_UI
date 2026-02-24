import { get, post, put, remove } from "@app/core/axios/axios";
import { TResult } from "@app/core/types/TResult";
import { Location, LocationCreate, LocationUpdate } from "../types/location.types";

export const getAllLocations = async (): Promise<TResult<Location[]>> => {
  return await get<Location[]>("/locations");
};

export const getLocationById = async (id: number): Promise<TResult<Location>> => {
  return await get<Location>(`/locations/${id}`);
};

export const createLocation = async (
  data: LocationCreate
): Promise<TResult<Location>> => {
  return await post<Location>("/locations", data);
};

export const updateLocation = async (
  id: number,
  data: LocationUpdate
): Promise<TResult<Location>> => {
  return await put<Location>(`/locations/${id}`, data);
};

export const deleteLocation = async (
  id: number
): Promise<TResult<Location>> => {
  return await remove<Location>(`/locations/${id}`);
};
