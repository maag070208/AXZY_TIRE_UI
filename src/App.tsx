import LoginPage from "@app/modules/auth/pages/LoginPage";
import RegisterPage from "@app/modules/auth/pages/RegisterPage";
import { ITLoader } from "axzy_ui_system";
import { useEffect, useState } from "react"; // <--- Importa useState
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { PrivateRoutes } from "./core/routes/PrivateRoutes";
import { setAuth } from "./core/store/auth/auth.slice";
import HomePage from "./modules/home/pages/HomePage";
import TrainingModePage from "./modules/traningMode/pages/TraningModePage";
import DaySchedulePage from "./modules/daySchedules/pages/DaySchedulePage";
import ChildrenPage from "./modules/children/pages/ChildrenPage";
import AppointmentsPage from "./modules/appointments/pages/AppointmentsPage";
import CalendarPage from "./modules/calendar/pages/CalendarPage";
import PaymentsPage from "./modules/payments/pages/PaymentsPage";
import EvaluationFormPage from "./modules/evaluations/pages/EvaluationFormPage";


function App() {
  const token = useSelector((state: any) => state.auth.token);
  const dispatch = useDispatch();

  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    window.addEventListener("beforeunload", () => {});
    window.addEventListener("unload", handleTabClosing);
    return () => {
      window.removeEventListener("beforeunload", () => {});
      window.removeEventListener("unload", handleTabClosing);
    };
  });

  const handleTabClosing = () => {
    localStorage.setItem("token", token);
  };

  // 2. Modifica el useEffect para usar el estado de listo
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken && storedToken !== "null") {
      dispatch(setAuth(storedToken));
    }
    // Marca la aplicación como lista después de la verificación
    setIsAppReady(true);
  }, [dispatch]);

  // 3. Si la aplicación no está lista, no renderices nada (o un loader)
  if (!isAppReady) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <ITLoader size="lg" />
      </div>
    );
  }

  // 4. Si el token no existe en Redux, redirige al login
  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // 5. Si el token existe, renderiza las rutas protegidas
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<PrivateRoutes />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/training-modes" element={<TrainingModePage />} />
        <Route path="/day-schedule" element={<DaySchedulePage />} />
        <Route path="/children" element={<ChildrenPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/evaluations/new" element={<EvaluationFormPage />} />

      </Route>
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  );
}

export default App;
