import { ITLayout } from "axzy_ui_system";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { NAVBAR_LOGO, useNavigationItems } from "../constants/navbar.constants";
import { isAuthenticated, logout } from "../store/auth/auth.slice";
import { AppDispatch, AppState } from "../store/store";
import { useEffect, useRef, useState } from "react";
import { getNotifications } from "@app/modules/notifications/service/NotificationService";

export const PrivateRoutes = () => {
  const isAuth = useSelector(isAuthenticated);
  const user = useSelector((state: AppState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const navigationItems = useNavigationItems();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const lastNotificationIdRef = useRef<number>(0);

  useEffect(() => {
      // Initialize ID ref to current latest to avoid spam on refresh
      if (user.id && user.role === 'ADMIN') {
          getNotifications(user.id!).then(res => {
              if (res && res.data && res.data.length > 0) {
                  lastNotificationIdRef.current = res.data[0].id;
              }
          });
      }
  }, [user.id]);

  useEffect(() => {
    if (!user.id || user.role !== 'ADMIN') return;

    const interval = setInterval(async () => {
        try {
            const res = await getNotifications(user.id!);
            if (res && res.data && res.data.length > 0) {
                const latest = res.data[0];
                if (latest.id > lastNotificationIdRef.current) {
                    setToastMessage(latest.message);
                    setShowToast(true);
                    lastNotificationIdRef.current = latest.id;
                    setTimeout(() => setShowToast(false), 6000);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }, 10000); // 10 seconds poll

    return () => clearInterval(interval);
  }, [user.id, user.role]);

  return isAuth ? (
    <ITLayout
      topBar={{
        logo: <NAVBAR_LOGO />,
        userMenu: {
          userName: user.name || "Usuario",
          userEmail: user.email || "email@example.com",
          menuItems: [
            {
              label: "Cerrar Sesión",
              onClick: () => {
                dispatch(logout());
                navigate("/login");
              },
            },
          ],
        },
      }}
      sidebar={{
        navigationItems: navigationItems,
      }}
    >
      <Outlet />
      {showToast && (
          <div className="fixed top-5 right-5 z-50 animate-bounce">
              <div className="bg-white border-l-4 border-red-500 shadow-xl rounded-lg p-4 max-w-sm flex items-start gap-3">
                  <div className="flex-1">
                      <p className="font-bold text-gray-900">Nueva Notificación</p>
                      <p className="text-gray-600 text-sm mt-1">{toastMessage}</p>
                      <button 
                        onClick={() => navigate("/notifications")}
                        className="text-xs text-indigo-600 font-bold mt-2 hover:underline"
                      >
                          Ver notificaciones
                      </button>
                  </div>
                  <button onClick={() => setShowToast(false)} className="text-gray-400 hover:text-gray-600">
                      ×
                  </button>
              </div>
          </div>
      )}
    </ITLayout>
  ) : (
    <Navigate to="/login" />
  );
};
