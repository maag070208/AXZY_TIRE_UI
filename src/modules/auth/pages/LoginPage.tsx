import { setAuth } from "@app/core/store/auth/auth.slice";
import { AppDispatch } from "@app/core/store/store";
import { showToast } from "@app/core/store/toast/toast.slice";
import Logo from "@assets/logo.png";
import TirePattern from "@assets/tire_pattern.png";
import { IAuthLogin } from "@core/types/auth.types";
import { ITCard } from "@axzydev/axzy_ui_system";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import LoginFormComponent from "../components/LoginForm";
import { login } from "../services/AuthService";

const LoginPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleSubmit = async (values: IAuthLogin) => {
    const response = await login({
      ...values,
    }).catch(() => {
      dispatch(
        showToast({
          message: "Error al iniciar sesión",
          type: "error",
          position: "top-right",
        })
      );
      return null;
    });

    if (response) {
      if(!response.success){
        dispatch(
          showToast({
            message: response.message,
            type: "error",
            position: "top-right",
          })
        );
        return;
      }

      dispatch(setAuth(response.data));
      navigate("/home");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen overflow-hidden bg-slate-50 relative w-full">
      
      {/* Repeating Tire Pattern Layer */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url(${TirePattern})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '400px', // Adjust size of the pattern if necessary
        }}
      ></div>

      <div className="z-10 w-full px-4 sm:px-6 flex justify-center">
        <ITCard
          contentClassName="w-full sm:p-10"
          className="w-full max-w-[480px] relative overflow-hidden flex flex-col items-center bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 rounded-[2rem]"
        >
          <div className="flex flex-col items-center w-full py-8 px-2 sm:px-4 space-y-10">
            {/* Header / Logo */}
            <div className="flex flex-col items-center space-y-6 w-full">
              <img src={Logo} alt={"Logo"} className="h-[140px] object-contain drop-shadow-sm" />
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Iniciar Sesión</h1>
                <p className="text-base text-slate-500">Bienvenido de vuelta, ingresa para continuar</p>
              </div>
            </div>

            {/* Form */}
            <div className="w-full">
              <LoginFormComponent onSubmit={handleSubmit} />
            </div>
          </div>
        </ITCard>
      </div>
    </div>
  );
};

export default LoginPage;
