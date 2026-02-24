import { ITButton, ITInput, ITSelect } from "@axzydev/axzy_ui_system";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { LocationCreate, LocationUpdate } from "../types/location.types";

const validationSchema = Yup.object({
  description: Yup.string(),
  aisle: Yup.string().required("El pasillo es requerido"),
  level: Yup.string().required("El nivel es requerido"),
  isActive: Yup.boolean(),
});

interface LocationFormProps {
  initialValues?: any;
  onSubmit: (values: LocationCreate | LocationUpdate) => void;
  isLoading?: boolean;
}

const statusOptions = [
  { id: "true", name: "Activo" },
  { id: "false", name: "Inactivo" },
];

const LocationForm = ({ initialValues, onSubmit, isLoading }: LocationFormProps) => {
  const defaultValues = {
    description: "",
    aisle: "",
    level: "",
    isActive: true,
  };

  const [formValues, setFormValues] = useState<any>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setFormValues({
        description: initialValues.description || "",
        aisle: initialValues.aisle || "",
        level: initialValues.level || "",
        isActive: initialValues.isActive !== undefined ? initialValues.isActive : true,
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
        const name = `${values.aisle} - ${values.level}`;
        onSubmit({ ...values, name });
      }}
    >
      {({ handleChange, handleBlur, values, errors, touched, isValid, setFieldValue }) => (
        <Form className="flex flex-col gap-4">

          <ITInput
            name="description"
            label="Descripción"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.description as string}
            touched={touched.description as boolean}
            placeholder="Opcional"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <ITInput
                name="aisle"
                label="Pasillo"
                value={values.aisle}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.aisle as string}
                touched={touched.aisle as boolean}
                placeholder="Ej: Pasillo A"
            />
            <ITInput
                name="level"
                label="Nivel"
                value={values.level}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.level as string}
                touched={touched.level as boolean}
                placeholder="Ej: Nivel 3"
            />
          </div>
          
          <ITSelect
             name="isActive"
             label="Estado"
             value={values.isActive}
             onChange={({ target }) => setFieldValue("isActive", target.value === 'true')}
             onBlur={handleBlur}
             options={statusOptions}
             labelField="name"
             valueField="id"
             error={errors.isActive as string}
             touched={touched.isActive as boolean}
             required
          />

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

export default LocationForm;
