import { AppState } from "@app/core/store/store";
import { showToast } from "@app/core/store/toast/toast.slice";
import { ITButton, ITLoader } from "@axzydev/axzy_ui_system";
import { useCallback, useEffect, useState } from "react";
import { FaCashRegister } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { CashRegisterModal } from "../components/CashRegisterModal";
import { CloseRegisterModal } from "../components/CloseRegisterModal";
import {
  CashRegisterSession,
  getActiveSession,
} from "../services/CashRegisterService";
import { getSystemSettings, SystemSettings } from "../services/SettingsService";
import { PosInterface } from "../components/PosInterface";
import { CheckoutModal } from "../components/CheckoutModal";
import { createSale, CreateSalePayload } from "../services/SalesService";
import { printComponent } from "@app/core/utils/print.utils";
import { TicketTemplate, TicketTemplateProps } from "../../sales/components/TicketTemplate";

const POSPage = () => {
  const user = useSelector((state: AppState) => state.auth);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [activeSession, setActiveSession] = useState<CashRegisterSession | null>(
    null
  );
  const [showOpenRegisterModal, setShowOpenRegisterModal] = useState(false);
  const [showCloseRegisterModal, setShowCloseRegisterModal] = useState(false);
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutCart, setCheckoutCart] = useState<any[]>([]);
  const [checkoutTotal, setCheckoutTotal] = useState(0);
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [clearCartFn, setClearCartFn] = useState<(() => void) | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [settingsRes, sessionRes] = await Promise.all([
        getSystemSettings(),
        getActiveSession(Number(user.id)),
      ]);

      if (settingsRes?.data) setSettings(settingsRes.data);
      if (sessionRes?.data) setActiveSession(sessionRes.data);
    } catch (error) {
      console.error("Error fetching POS startup data", error);
      // Only show error if it's not a 404 (no active session is a 404 in some APIs, or just null)
      if ((error as any)?.response?.status !== 404) {
          dispatch(
            showToast({ message: "Error al cargar configuración", type: "error" })
          );
      } else {
          setActiveSession(null); // Explicitly set to null if 404
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <ITLoader />
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="flex flex-col h-full bg-gray-50 items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center max-w-md text-center">
          <FaCashRegister className="text-6xl text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Caja Cerrada</h2>
          <p className="text-gray-600 mb-6">
            Actualmente no tienes un turno de caja abierto. Para comenzar a realizar ventas en el Punto de Venta es necesario abrir el turno.
          </p>
          <ITButton
            label="Abrir Turno de Caja"
            color="primary"
            onClick={() => setShowOpenRegisterModal(true)}
            className="w-full justify-center text-lg py-3"
          />
        </div>

        <CashRegisterModal
          isOpen={showOpenRegisterModal}
          onClose={() => setShowOpenRegisterModal(false)}
          userId={Number(user?.id)}
          onSuccess={fetchData}
        />
      </div>
    );
  }


  const handleOpenCheckout = (cart: any[], total: number, clearCart: () => void) => {
    setCheckoutCart(cart);
    setCheckoutTotal(total);
    setClearCartFn(() => clearCart);
    setIsCheckoutOpen(true);
  };

  const handleConfirmSale = async (
    paymentMethod: "EFECTIVO" | "TARJETA" | "TRANSFERENCIA" | "OTRO",
    _cashGiven?: number
  ) => {
    if (!activeSession || !user?.id) return;

    try {
      setIsProcessingSale(true);

      const tires = checkoutCart
        .filter((c) => c.type === "TIRE")
        .map((c) => ({
          tireId: c.id,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
          subtotal: c.subtotal,
        }));

      const services = checkoutCart
        .filter((c) => c.type === "SERVICE")
        .map((c) => ({
          serviceId: c.id,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
          subtotal: c.subtotal,
        }));

      const payload: CreateSalePayload = {
        userId: Number(user.id),
        sessionId: activeSession.id,
        subtotal: checkoutTotal,
        discount: 0,
        taxes: 0,
        total: checkoutTotal,
        paymentMethod,
        tires,
        services,
      };

      const res = await createSale(payload);

      dispatch(
        showToast({
          message: "Venta completada exitosamente",
          type: "success",
        })
      );
      setIsCheckoutOpen(false);
      
      if (clearCartFn) clearCartFn();

      const saleId = res.data?.id || 0;
      
      const printItems: TicketTemplateProps['items'] = checkoutCart.map(c => ({
        name: c.name,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        subtotal: c.subtotal
      }));

      printComponent(
         <TicketTemplate
            folio={saleId}
            date={new Date().toISOString()}
            cashierName={`${user?.name || 'Cajero'}`}
            items={printItems}
            total={checkoutTotal}
            paymentMethod={paymentMethod}
            businessName={settings?.businessName || "Ticket de Venta"}
            businessAddress={settings?.address || ""}
            businessPhone={settings?.phone || ""}
         />,
         `Ticket_Venta_${saleId}`
      );
      
      fetchData();
    } catch (error: any) {
      dispatch(
        showToast({
          message: error?.response?.data?.message || "Error al procesar la venta",
          type: "error",
        })
      );
    } finally {
      setIsProcessingSale(false);
    }
  };

  const expectedAmount = Number(activeSession.initialAmount) + Number(activeSession.totalSales);

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Punto de Venta</h1>
          <p className="text-sm text-gray-500">
            {settings?.businessName} • Turno Activo: {activeSession.id}
          </p>
        </div>
        <div>
           <div className="flex gap-4 items-center">
             <div className="text-right hidden sm:block">
               <span className="text-xs text-gray-500 block">Fondo + Ventas</span>
               <span className="font-semibold text-green-600">${expectedAmount.toFixed(2)}</span>
             </div>
             <ITButton 
               label="Corte de Caja" 
               color="danger" 
               variant="outlined" 
               onClick={() => setShowCloseRegisterModal(true)}
             />
           </div>
        </div>
      </div>

      <PosInterface onCheckout={handleOpenCheckout} />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        total={checkoutTotal}
        onConfirm={handleConfirmSale}
        isProcessing={isProcessingSale}
      />

      {/* Close Register Modal */}
      <CloseRegisterModal
        isOpen={showCloseRegisterModal}
        onClose={() => setShowCloseRegisterModal(false)}
        activeSession={activeSession}
        onSuccess={() => {
           setActiveSession(null);
           fetchData();
        }}
      />
    </div>
  );
};

export default POSPage;
