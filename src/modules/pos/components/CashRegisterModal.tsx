import { ITButton, ITDialog, ITInput } from "@axzydev/axzy_ui_system";
import { useFormik } from "formik";
import * as Yup from "yup";
import { openSession } from "../services/CashRegisterService";
import { useDispatch } from "react-redux";
import { showToast } from "@app/core/store/toast/toast.slice";

interface CashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  onSuccess: () => void;
}

const validationSchema = Yup.object({
  initialAmount: Yup.number()
    .required("El monto inicial es obligatorio")
    .min(0, "El monto no puede ser negativo"),
});

export const CashRegisterModal = ({
  isOpen,
  onClose,
  userId,
  onSuccess,
}: CashRegisterModalProps) => {
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      initialAmount: 0,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await openSession(userId, values.initialAmount);
        dispatch(
          showToast({
            message: "Turno de caja abierto exitosamente",
            type: "success",
          })
        );
        onSuccess();
        onClose();
      } catch (error: any) {
        dispatch(
          showToast({
            message: error?.response?.data?.message || error?.message || "Error al abrir caja",
            type: "error",
          })
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <ITDialog isOpen={isOpen} onClose={onClose} title="Apertura de Caja">
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
        <p className="text-gray-600 text-sm">
          Para comenzar a vender, necesitas declarar el monto inicial en caja (Fondo de caja).
        </p>

        <ITInput
          name="initialAmount"
          label="Monto Inicial en Caja ($)"
          type="number"
          value={formik.values.initialAmount.toString()}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.initialAmount as string}
          touched={formik.touched.initialAmount as boolean}
        />

        <div className="flex justify-end gap-2 mt-4">
          <ITButton
            label="Cancelar"
            variant="outlined"
            onClick={onClose}
            disabled={formik.isSubmitting}
          />
          <ITButton
            label="Abrir Turno"
            color="primary"
            type="submit"
            disabled={formik.isSubmitting}
          />
        </div>
      </form>
    </ITDialog>
  );
};
