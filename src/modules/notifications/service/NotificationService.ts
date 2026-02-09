import { get, put } from "@app/core/axios/axios";

export interface AppNotification {
  id: number;
  userId: number;
  message: string;
  read: boolean;
  createdAt: string;
}

export const getNotifications = (userId: number) => {
  return get<AppNotification[]>(`/notifications/${userId}`);
};

export const markAsRead = (id: number) => {
  return put(`/notifications/${id}/read`, {});
};

export const markAllAsRead = (userId: number) => {
    return put(`/notifications/${userId}/read-all`, {});
}
