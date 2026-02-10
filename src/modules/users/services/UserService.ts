import { get, post, put, remove } from "@app/core/axios/axios";
import { TResult } from "@app/core/types/TResult";
import { User, UserCreate, UserUpdate } from "../types/user.types";

export const getCoaches = async (): Promise<TResult<User[]>> => {
  return await get<User[]>("/users/coaches");
};

export const getAllUsers = async (): Promise<TResult<User[]>> => {
  return await get<User[]>("/users");
};

export const createUser = async (data: UserCreate): Promise<TResult<User>> => {
  return await post("/users", data);
};

export const updateUser = async (
  id: number,
  data: UserUpdate
): Promise<TResult<User>> => {
  return await put(`/users/${id}`, data);
};

export const deleteUser = async (id: number): Promise<TResult<any>> => {
  return await remove(`/users/${id}`);
};
