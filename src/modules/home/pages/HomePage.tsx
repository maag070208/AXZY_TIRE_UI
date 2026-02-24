import { AppState } from "@app/core/store/store";
import { useEffect, useState } from "react";
import { FaUsers, FaCompactDisc, FaWrench, FaCashRegister, FaMoneyCheckAlt, FaMapMarkerAlt } from "react-icons/fa";
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

    const cards = [];

    if (user.role === "ADMIN" || user.role === "SUPERVISOR") {
        cards.push(
            {
              title: "Punto de Venta",
              description: "Procesar ventas, generar cotizaciones y atender clientes",
              icon: <FaCashRegister />,
              action: () => navigate("/pos"),
            },
            {
              title: "Historial Ventas",
              description: "Consulta las transacciones y tickets anteriores",
              icon: <FaMoneyCheckAlt />,
              action: () => navigate("/sales"),
            },
            {
              title: "Usuarios",
              description: "Administra los usuarios del sistema (Cajeros, Técnicos, Supervisores)",
              icon: <FaUsers />,
              action: () => navigate("/users"),
            },
            {
              title: "Ubicaciones",
              description: "Administra las sucursales y puntos de almacenamiento",
              icon: <FaMapMarkerAlt />,
              action: () => navigate("/locations"),
            },
            {
              title: "Inventario Llantas",
              description: "Registra y consulta el catálogo de llantas nuevas y usadas",
              icon: <FaCompactDisc />,
              action: () => navigate("/tires"),
            },
            {
              title: "Catálogo de Servicios",
              description: "Administra reparaciones, mantenimiento y otros servicios aplicables",
              icon: <FaWrench />,
              action: () => navigate("/services"),
            }
        );
    } else if (user.role === "CAJERO") {
       cards.push(
            {
              title: "Punto de Venta",
              description: "Procesar ventas, generar cotizaciones y atender clientes",
              icon: <FaCashRegister />,
              action: () => navigate("/pos"),
            },
            {
              title: "Historial Ventas",
              description: "Consulta las transacciones y tickets anteriores",
              icon: <FaMoneyCheckAlt />,
              action: () => navigate("/sales"),
            }
       );
    }
    
    setHomeCardItem(cards);
  }, [user, navigate]);

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
