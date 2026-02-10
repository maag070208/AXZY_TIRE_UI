import { AppState } from "@app/core/store/store";
import LOGO from "@assets/logo.png";
import {
  FaBell,
  FaCalendarAlt,
  FaChild,
  FaClock,
  FaDumbbell,
  FaHome,
  FaListAlt,
  FaUsers,
  FaMoneyBillWave,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

export const useNavigationItems = (): any[] => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: AppState) => state.auth);

  const isRouteActive = (path: string, subroutes?: string[]) => {
    if (subroutes?.length) {
      return subroutes.some((subroute) =>
        location.pathname.startsWith(subroute)
      );
    }
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const baseItems: any[] = [
    {
      id: "home",
      label: "Inicio",
      action: () => navigate("/home"),
      isActive: isRouteActive("/home") || isRouteActive("/home"),
      icon: <FaHome className="text-white" />,
    },
    {
      id: "children",
      label: user.role === "ADMIN" ? "Alumnos" : "Hijos",
      action: () => navigate("/children"),
      isActive: isRouteActive("/children"),
      icon: <FaChild className="text-white" />,
    },
    {
      id: "appointments",
      label: "Citas",
      action: () => navigate("/appointments"),
      icon: <FaListAlt className="text-white" />,
      isActive: isRouteActive("/appointments"),
    },
    {
      id: "calendar",
      label: "Calendario",
      action: () => navigate("/calendar"),
      isActive: isRouteActive("/calendar"),
      icon: <FaCalendarAlt className="text-white" />,
    },
  ].filter(item => {
    if (user?.role === "COACH" && item.id === "children") {
        return false;
    }
    return true;
  });

  if (user?.role === "ADMIN") {
    baseItems.push(
      {
        id: "day-schedule",
        label: "Horarios",
        action: () => navigate("/day-schedule"),
        isActive: isRouteActive("/day-schedule"),
        icon: <FaClock className="text-white" />,
      },
      {
        id: "training-modes",
        label: "Modos de Entrenamiento",
        action: () => navigate("/training-modes"),
        icon: <FaDumbbell className="text-white" />,
        isActive: isRouteActive("/training-modes"),
      },
      {
        id: "payments",
        label: "Pagos",
        action: () => navigate("/payments"),
        icon: <FaMoneyBillWave className="text-white" />,
        isActive: isRouteActive("/payments"),
      },
      {
        id: "users",
        label: "Usuarios",
        action: () => navigate("/users"),
        icon: <FaUsers className="text-white" />,
        isActive: isRouteActive("/users"),
      },
      {
        id: "notifications",
        label: "Notificaciones",
        action: () => navigate("/notifications"),
        icon: <FaBell className="text-white" />,
        isActive: isRouteActive("/notifications"),
      },
    );
  }

  return baseItems;
};

// ------------- NAVBAR (legacy) -----------------
export const Navbar = () => {
  const navigationItems = useNavigationItems();

  return (
    <div className="flex flex-row space-x-4">
      {navigationItems.map((item) => (
        <button
          key={item.id}
          onClick={item.action}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            item.isActive
              ? "bg-blue-100 text-blue-700"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export const NAVBAR_LOGO = () => (
  <img src={LOGO} className="h-[100px] hidden md:flex" />
);

export const SIDEBAR_LOGO = () => (
  <img src={LOGO} className="mt-5 h-[100px] flex md:hidden" />
);
