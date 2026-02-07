import { AppState } from "@app/core/store/store";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaChild, FaClock, FaDumbbell, FaListAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { HomeCardItem } from "../components/HomeCardItem";

const HomePage = () => {
  const navigate = useNavigate();
  const user = useSelector((state: AppState) => state.auth);

  const [homeCardItem, setHomeCardItem] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !user.token) {
      navigate("/login");
      return;
    }

    const cards = [
      {
        title: "Hijos",
        description: "Administra los hijos registrados del usuario",
        icon: <FaChild />,
        action: () => navigate("/children"),
      },
      {
        title: "Citas",
        description: "Consulta y gestiona tus citas activas",
        icon: <FaListAlt />,
        action: () => navigate("/appointments"),
      },
      {
        title: "Calendario",
        description: "Consulta los horarios de entrenamiento",
        icon: <FaCalendarAlt />,
        action: () => navigate("/calendar"),
      },
    ];

    if (user.role === "ADMIN") {
        cards.push(
            {
              title: "Horarios",
              description: "Consulta los horarios por día, semana o disponibilidad",
              icon: <FaClock />,
              action: () => navigate("/day-schedule"),
            },
            {
              title: "Modos de Entrenamiento",
              description: "Administra los diferentes modos de entrenamiento",
              icon: <FaDumbbell />,
              action: () => navigate("/training-modes"),
            },
        );
    }
    
    setHomeCardItem(cards);
  }, [user]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
        <div className="px-6 py-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800">Bienvenido</h1>
                <p className="text-gray-500 mt-1">Selecciona una opción para comenzar</p>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {homeCardItem.map((item, index) => (
                    <HomeCardItem key={index} item={item} index={index} />
                  ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default HomePage;
