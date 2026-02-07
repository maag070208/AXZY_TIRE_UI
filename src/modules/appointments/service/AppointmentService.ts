import { get, remove } from "@app/core/axios/axios";
import { TResult } from "@app/core/types/TResult";

export interface Appointment {
  id: number;
  userId: number;
  childId: number;
  scheduleId: number;
  modeId: number;
  createdAt: string;
  child: {
    id: number;
    name: string;
    lastName: string;
  };
  schedule: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    modeId: number;
  };
  mode: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    name: string;
    lastName: string;
  };
}

export const getAllAppointments = async (): Promise<TResult<Appointment[]>> => {
  return await get("/appointments");
};

export const getAppointmentsByUser = async (userId: number): Promise<TResult<Appointment[]>> => {
  return await get(`/appointments/user/${userId}`);
};

export const deleteAppointment = async (id: number): Promise<TResult<any>> => {
  return await remove(`/appointments/${id}`);
};
