import { ITButton, ITDialog, ITInput } from "@axzydev/axzy_ui_system";
import { useState } from "react";
import { CashRegisterSession, closeSession } from "../services/CashRegisterService";
import { useDispatch } from "react-redux";
import { showToast } from "@app/core/store/toast/toast.slice";

interface CloseRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSession: CashRegisterSession;
  onSuccess: () => void;
}

export const CloseRegisterModal = ({
  isOpen,
  onClose,
  activeSession,
  onSuccess,
}: CloseRegisterModalProps) => {
  const dispatch = useDispatch();
  const [realAmountStr, setRealAmountStr] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const expectedAmount = Number(activeSession.initialAmount) + Number(activeSession.totalSales);

  const handleConfirmClose = async () => {
    try {
      setIsProcessing(true);
      const realAmount = Number(realAmountStr) || expectedAmount;
      await closeSession(activeSession.id, expectedAmount, realAmount);
      dispatch(showToast({ message: "Turno cerrado exitosamente", type: "success" }));
      setRealAmountStr("");
      onSuccess();
      onClose();
    } catch (error: any) {
      dispatch(
        showToast({
          message: error?.response?.data?.message || "Error al cerrar la caja",
          type: "error",
        })
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ITDialog isOpen={isOpen} onClose={onClose} title="Corte de Caja">
      <div className="flex flex-col gap-4">
        <p className="text-gray-600 text-sm">
          Estás a punto de cerrar el turno de caja actual. Por favor verifica los montos finales.
        </p>
        
        <div className="bg-gray-50 p-4 rounded border border-gray-200 grid grid-cols-2 gap-2 text-sm">
           <span className="text-gray-500">Fondo Inicial:</span>
           <span className="font-medium text-right">${Number(activeSession.initialAmount).toFixed(2)}</span>
           
           <span className="text-gray-500">Total en Ventas:</span>
           <span className="font-medium text-green-600 text-right">+ ${Number(activeSession.totalSales).toFixed(2)}</span>
           
           <span className="text-gray-800 font-bold mt-2 pt-2 border-t">Monto Esperado:</span>
           <span className="font-bold text-blue-600 text-right mt-2 pt-2 border-t">${expectedAmount.toFixed(2)}</span>
        </div>

        <div className="mt-2">
          <ITInput
            label="Efectivo Físico Real (Opcional)"
            placeholder="Ej: 5000.00"
            type="number"
            value={realAmountStr}
            onChange={(e) => setRealAmountStr(e.target.value)}
            onBlur={() => {}}
            name="realAmount"
          />
          <p className="text-xs text-gray-500 mt-1">
            Si existe alguna diferencia (sobrante o faltante), ingrese la cantidad real encontrada en caja. Dejar vacío si la caja cuadra perfectamente.
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-4">
           <ITButton 
              label="Cancelar" 
              variant="outlined" 
              color="secondary" 
              onClick={onClose} 
              disabled={isProcessing} 
           />
           <ITButton 
              label={isProcessing ? "Procesando..." : "Confirmar Corte"} 
              color="danger" 
              onClick={handleConfirmClose} 
              disabled={isProcessing} 
           />
        </div>
      </div>
    </ITDialog>
  );
};
