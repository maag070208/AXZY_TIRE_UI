import { ITButton, ITInput } from "@axzydev/axzy_ui_system";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Service } from "../types/service.types";

interface ServiceFormProps {
  initialValues: Service | null;
  onSubmit: (values: any) => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required("El nombre es requerido"),
  category: Yup.string(),
  description: Yup.string(),
  basePrice: Yup.number()
    .required("El precio base es requerido")
    .min(0, "El precio no puede ser negativo"),
});

const ServiceForm = ({ initialValues, onSubmit }: ServiceFormProps) => {
  const formik = useFormik({
    initialValues: {
      name: initialValues?.name || "",
      category: initialValues?.category || "",
      description: initialValues?.description || "",
      basePrice: initialValues?.basePrice || 0,
      isActive: initialValues ? initialValues.isActive : true,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  } = formik;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 md:col-span-2">
          <ITInput
            name="name"
            label="Nombre del Servicio"
            type="text"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name as string}
            touched={touched.name as boolean}
            placeholder="Ej: Parchado de lona"
          />
        </div>

        <ITInput
          name="category"
          label="Categoría"
          type="text"
          value={values.category}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.category as string}
          touched={touched.category as boolean}
          placeholder="Ej: Reparación, Mantenimiento"
        />

        <ITInput
          name="basePrice"
          label="Precio Base"
          type="number"
          value={values.basePrice.toString()}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.basePrice as string}
          touched={touched.basePrice as boolean}
        />

        <div className="col-span-1 md:col-span-2">
          <ITInput
            name="description"
            label="Descripción"
            type="text"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.description as string}
            touched={touched.description as boolean}
          />
        </div>

        {initialValues && (
           <div className="col-span-1 flex items-center">
             <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
               <input
                 type="checkbox"
                 name="isActive"
                 checked={formik.values.isActive}
                 onChange={formik.handleChange}
                 className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
               />
               <span>Servicio Activo</span>
             </label>
           </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <ITButton type="submit" label="Guardar Servicio" color="primary" />
      </div>
    </form>
  );
};

export default ServiceForm;
