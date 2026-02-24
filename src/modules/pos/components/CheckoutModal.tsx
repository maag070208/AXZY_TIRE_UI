import { ITButton, ITDialog, ITInput } from "@axzydev/axzy_ui_system";
import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import { FaMoneyBillAlt, FaCreditCard, FaExchangeAlt } from "react-icons/fa";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onConfirm: (paymentMethod: "EFECTIVO" | "TARJETA" | "TRANSFERENCIA" | "OTRO", cashGiven?: number) => void;
  isProcessing: boolean;
}

export const CheckoutModal = ({
  isOpen,
  onClose,
  total,
  onConfirm,
  isProcessing,
}: CheckoutModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"EFECTIVO" | "TARJETA" | "TRANSFERENCIA" | "OTRO">("EFECTIVO");

  const formik = useFormik({
    initialValues: {
      cashGiven: total,
    },
    validationSchema: Yup.object({
      cashGiven: Yup.number()
        .min(paymentMethod === "EFECTIVO" ? total : 0, "El monto recibido es menor al total")
        .typeError("Debe ser un número válido"),
    }),
    onSubmit: (values) => {
      onConfirm(paymentMethod, values.cashGiven);
    },
    enableReinitialize: true,
  });

  const change = (formik.values.cashGiven || 0) - total;

  return (
    <ITDialog isOpen={isOpen} onClose={onClose} title="Resumen de Cobro">
      <div className="flex flex-col gap-6 md:w-[400px]">
        {/* Payment Total */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <span className="text-gray-500 font-medium">Total a Pagar</span>
            <div className="text-4xl font-bold text-gray-900 mt-2">${total.toFixed(2)}</div>
        </div>

        {/* Payment Methods */}
        <div>
            <span className="text-sm font-bold text-gray-700 mb-3 block">Método de Pago</span>
            <div className="grid grid-cols-2 gap-3">
                <button
                 type="button"
                 onClick={() => setPaymentMethod("EFECTIVO")}
                 className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 border transition-all ${paymentMethod === "EFECTIVO" ? 'bg-green-50 border-green-500 text-green-700 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                    <FaMoneyBillAlt /> Efectivo
                </button>
                <button
                 type="button"
                 onClick={() => setPaymentMethod("TARJETA")}
                 className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 border transition-all ${paymentMethod === "TARJETA" ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                    <FaCreditCard /> Tarjeta
                </button>
                <button
                 type="button"
                 onClick={() => setPaymentMethod("TRANSFERENCIA")}
                 className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 border transition-all ${paymentMethod === "TRANSFERENCIA" ? 'bg-purple-50 border-purple-500 text-purple-700 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                    <FaExchangeAlt /> Transferencia
                </button>
            </div>
        </div>

        {/* Change Calculator (Efectivo only) */}
        {paymentMethod === "EFECTIVO" && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                 <form onSubmit={formik.handleSubmit} id="checkout-form">
                     <ITInput 
                         name="cashGiven"
                         label="Monto Recibido ($)"
                         type="number"
                         value={formik.values.cashGiven.toString()}
                         onChange={formik.handleChange}
                         onBlur={formik.handleBlur}
                         error={formik.errors.cashGiven as string}
                         touched={formik.touched.cashGiven as boolean}
                     />
                 </form>

                 <div className="flex justify-between items-center text-lg mt-2 pt-4 border-t border-gray-100">
                     <span className="text-gray-500">Cambio a Entregar:</span>
                     <span className={`font-bold ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>${Math.max(0, change).toFixed(2)}</span>
                 </div>
            </div>
        )}

        {/* Actions */}
         <div className="flex gap-3 justify-end mt-4">
          <ITButton
            label="Cancelar"
            variant="outlined"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 justify-center"
          />
          {paymentMethod === "EFECTIVO" ? (
             <ITButton
                label={isProcessing ? "Procesando..." : "Confirmar Pago"}
                color="primary"
                onClick={() => formik.handleSubmit()}
                disabled={isProcessing || !formik.isValid}
                className="flex-1 justify-center"
             />
          ) : (
            <ITButton
                label={isProcessing ? "Procesando..." : "Confirmar Pago"}
                color="primary"
                onClick={() => onConfirm(paymentMethod)}
                disabled={isProcessing}
                className="flex-1 justify-center"
            />
          )}
        </div>
      </div>
    </ITDialog>
  );
};
