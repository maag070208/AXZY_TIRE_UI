import { AppState } from "@app/core/store/store";
import { ITLoader } from "axzy_ui_system";
import { useEffect, useState } from "react";
import { FaBell, FaCheck } from "react-icons/fa";
import { useSelector } from "react-redux";
import { AppNotification, getNotifications, markAsRead, markAllAsRead } from "../service/NotificationService";

const NotificationsPage = () => {
    console.log("NotificationsPage mounted");
    const user = useSelector((state: AppState) => state.auth);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        if (!user.id) return;
        setLoading(true);
        try {
            const res = await getNotifications(user.id);
            if (res?.data) {
                setNotifications(res.data);
            }
        } catch (error) {
            console.error("Error fetching notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
           await markAsRead(id);
           fetchNotifications();
        } catch (error) {
            console.error("Error marking as read", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user.id) return;
        try {
            await markAllAsRead(user.id);
            fetchNotifications();
        } catch (error) {
            console.error("Error marking all as read", error);
        }
    }

    useEffect(() => {
        fetchNotifications();
    }, [user.id]);

    if (loading && notifications.length === 0) {
        return (
            <div className="flex h-full items-center justify-center p-10">
                <ITLoader />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Notificaciones</h1>
                {notifications.some(n => !n.read) && (
                    <button 
                        onClick={handleMarkAllAsRead}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
                    >
                        <FaCheck /> Marcar todas como leídas
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
                <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                    {notifications.map((notification) => (
                        <div 
                            key={notification.id} 
                            className={`p-4 rounded-xl border ${notification.read ? 'bg-white border-gray-100 opacity-70' : 'bg-white border-indigo-100 shadow-sm border-l-4 border-l-indigo-500'} flex items-start gap-4 transition-all`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.read ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-500'}`}>
                                <FaBell />
                            </div>
                            <div className="flex-1">
                                <p className={`text-base ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                    {notification.message}
                                </p>
                                <span className="text-xs text-gray-400 mt-1 block">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </span>
                            </div>
                            {!notification.read && (
                                <button 
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="text-gray-400 hover:text-indigo-600 transition-colors p-2"
                                    title="Marcar como leída"
                                >
                                    <FaCheck />
                                </button>
                            )}
                        </div>
                    ))}

                    {notifications.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                             <FaBell className="text-6xl mb-4 opacity-20" />
                             <p>No tienes notificaciones.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
