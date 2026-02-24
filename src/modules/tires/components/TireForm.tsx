import { ITButton, ITInput, ITSelect } from "@axzydev/axzy_ui_system";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { Location } from "../../locations/types/location.types";
import { TireCreate, TireUpdate } from "../types/tire.types";

const validationSchema = Yup.object({
  brand: Yup.string().required("La marca es requerida"),
  model: Yup.string().required("El modelo es requerido"),
  size: Yup.string().required("La medida es requerida"),
  type: Yup.string().required("El tipo es requerido"),
  cost: Yup.number().required("El costo es requerido").min(0, "Costo no válido"),
  price: Yup.number().required("El precio es requerido").min(0, "Precio no válido"),
  currentStock: Yup.number().required("El stock actual es requerido").min(0, "Stock no válido"),
  minStock: Yup.number().min(0, "Stock mínimo no válido"),
  sku: Yup.string(),
  locationId: Yup.string().nullable(),
});

interface TireFormProps {
  initialValues?: any;
  onSubmit: (values: TireCreate | TireUpdate) => void;
  isLoading?: boolean;
  locations: Location[];
}

const typeOptions = [
  { id: "NUEVA", name: "Nueva" },
  { id: "SEMINUEVA", name: "Seminueva" },
  { id: "GALLITO", name: "Gallito (Uso)" },
];

const TireForm = ({ initialValues, onSubmit, isLoading, locations }: TireFormProps) => {
  const defaultValues = {
    brand: "",
    model: "",
    size: "",
    type: "NUEVA",
    cost: 0,
    price: 0,
    currentStock: 0,
    minStock: 0,
    sku: "",
    locationId: "",
  };

  const [formValues, setFormValues] = useState<any>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setFormValues({
        brand: initialValues.brand || "",
        model: initialValues.model || "",
        size: initialValues.size || "",
        type: initialValues.type || "NUEVA",
        cost: initialValues.cost || 0,
        price: initialValues.price || 0,
        currentStock: initialValues.currentStock || 0,
        minStock: initialValues.minStock || 0,
        sku: initialValues.sku || "",
        locationId: initialValues.locationId || "",
      });
    } else {
        setFormValues(defaultValues);
    }
  }, [initialValues]);

  return (
    <Formik
      initialValues={formValues}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={(values) => {
        const payload = {
            ...values,
            cost: Number(values.cost),
            price: Number(values.price),
            currentStock: Number(values.currentStock),
            minStock: Number(values.minStock),
            locationId: values.locationId ? Number(values.locationId) : null,
        }
        onSubmit(payload);
      }}
    >
      {({ handleChange, handleBlur, values, errors, touched, isValid }) => (
        <Form className="flex flex-col gap-4">

          <div className="grid grid-cols-2 gap-4">
             <ITInput
                name="brand"
                label="Marca"
                value={values.brand}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.brand as string}
                touched={touched.brand as boolean}
                required
                placeholder="Ej: Michelin"
             />
             <ITInput
                name="model"
                label="Modelo / Diseño"
                value={values.model}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.model as string}
                touched={touched.model as boolean}
                required
                placeholder="Ej: Pilot Sport 4"
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ITInput
                name="size"
                label="Medida"
                value={values.size}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.size as string}
                touched={touched.size as boolean}
                required
                placeholder="Ej: 205/55R16"
             />
             <ITInput
                name="sku"
                label="SKU / Código (Opcional)"
                value={values.sku}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.sku as string}
                touched={touched.sku as boolean}
                placeholder="Ej: MCH-2055516-PS4"
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ITSelect
                name="type"
                label="Tipo de Llanta"
                value={values.type}
                onChange={handleChange}
                onBlur={handleBlur}
                options={typeOptions}
                labelField="name"
                valueField="id"
                error={errors.type as string}
                touched={touched.type as boolean}
                required
              />
              <ITSelect
                name="locationId"
                label="Ubicación"
                value={values.locationId}
                onChange={handleChange}
                onBlur={handleBlur}
                options={locations.map((loc) => ({ id: loc.id.toString(), name: loc.name }))}
                labelField="name"
                valueField="id"
                error={errors.locationId as string}
                touched={touched.locationId as boolean}
              />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <ITInput
                name="cost"
                label="Costo ($)"
                type="number"
                value={values.cost}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.cost as string}
                touched={touched.cost as boolean}
                required
             />
             <ITInput
                name="price"
                label="Precio Base ($)"
                type="number"
                value={values.price}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.price as string}
                touched={touched.price as boolean}
                required
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <ITInput
                name="currentStock"
                label="Stock Actual"
                type="number"
                value={values.currentStock}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.currentStock as string}
                touched={touched.currentStock as boolean}
                required
             />
             <ITInput
                name="minStock"
                label="Stock Mínimo Alerta"
                type="number"
                value={values.minStock}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.minStock as string}
                touched={touched.minStock as boolean}
                required
             />
          </div>

          <div className="flex justify-end mt-4">
            <ITButton
              type="submit"
              disabled={!isValid || isLoading}
              label={initialValues ? "Actualizar" : "Guardar"}
            />
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default TireForm;
