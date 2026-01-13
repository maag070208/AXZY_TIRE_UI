import { get, post, put, remove } from "@app/core/axios/axios";
import { TResult } from "@app/core/types/TResult";
import {
  AssignTrainingMode,
  Children,
  ChildrenCreate,
  ChildrenUpdate,
} from "../types/children.types";


export const getAllChildren = async (): Promise<TResult<any[]>> => {
  return await get("/children");
};

export const getChildByUserId = async (id: number): Promise<TResult<Children[]>> => {
  return await get(`/children/user/${id}`);
};

export const createChild = async (data: any): Promise<TResult<ChildrenCreate>> => {
  return await post("/children", data);
};

export const deleteChild = async (id: number): Promise<TResult<any>> => {
  return await remove(`/children/${id}`);
};

export const getChildById = async (id: number): Promise<TResult<Children>> => {
  return await get(`/children/${id}`);
};

export const updateChild = async (
  id: number,
  data: ChildrenUpdate
): Promise<TResult<Children>> => {
  return await put(`/children/${id}`, data);
};

export const assignChildToTrainingMode = async (
  data: AssignTrainingMode
): Promise<TResult<any>> => {
  // Mapping to backend expected format: { userId, childId, scheduleId, modeId }
  const payload = {
    userId: data.userId,
    childId: data.childId,
    scheduleId: data.dayScheduleId,
    modeId: Number(data.trainingModeId), // Ensure number
  };
  return await post("/children/assign", payload);
};