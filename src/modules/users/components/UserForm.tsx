import { ITButton, ITInput, ITSelect } from "@axzydev/axzy_ui_system";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { UserCreate, UserRole } from "../types/user.types";

const validationSchema = Yup.object({
  name: Yup.string().required("El nombre es requerido"),
  lastName: Yup.string().required("El apellido es requerido"),
  username: Yup.string().required("El nombre de usuario es requerido"),
  role: Yup.string().required("El rol es requerido"),
  password: Yup.string().when("isEditing", {
    is: false,
    then: (schema) =>
      schema
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .required("La contraseña es requerida"),
    otherwise: (schema) => schema.min(6, "La contraseña debe tener al menos 6 caracteres"),
  }),
});

interface UserFormProps {
  initialValues?: any;
  onSubmit: (values: UserCreate) => void;
  isLoading?: boolean;
}

const roles = [
  { id: UserRole.ADMIN, name: "Administrador" },
  { id: UserRole.CAJERO, name: "Cajero/Ventas" },
  { id: UserRole.TECNICO, name: "Técnico" },
  { id: UserRole.SUPERVISOR, name: "Supervisor" },
];

const UserForm = ({ initialValues, onSubmit, isLoading }: UserFormProps) => {
  const defaultValues = {
    name: "",
    lastName: "",
    username: "",
    password: "",
    role: UserRole.CAJERO,
    isEditing: false,
  };

  const [formValues, setFormValues] = useState<any>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setFormValues({
        name: initialValues.name || "",
        lastName: initialValues.lastName || "",
        username: initialValues.username || "",
        password: "", // Don't populate password on edit
        role: initialValues.role || UserRole.CAJERO,
        isEditing: true,
      });
    }
  }, [initialValues]);

  return (
    <Formik
      initialValues={formValues}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={(values) => {
        const { isEditing, ...rest } = values;
        // If editing and password is empty, remove it so it's not updated
        if (isEditing && !rest.password) {
          delete rest.password;
        }
        onSubmit(rest);
      }}
    >
      {({ handleChange, handleBlur, values, errors, touched, isValid, setFieldValue }) => (
        <Form className="flex flex-col gap-4">
          <ITInput
            name="name"
            label="Nombre"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name as string}
            touched={touched.name as boolean}
            required
          />
          <ITInput
            name="lastName"
            label="Apellido"
            value={values.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.lastName as string}
            touched={touched.lastName as boolean}
            required
          />
          <ITInput
            name="username"
            label="Nombre de Usuario"
            value={values.username}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.username as string}
            touched={touched.username as boolean}
            required
          />
          
          <ITSelect
             name="role"
             label="Rol"
             value={values.role}
             onChange={({ target }) => setFieldValue("role", target.value)}
             onBlur={handleBlur}
             options={roles}
             labelField="name"
             valueField="id"
             error={errors.role as string}
             touched={touched.role as boolean}
             required
          />

          <ITInput
            name="password"
            label={initialValues ? "Contraseña (Opcional)" : "Contraseña"}
            type="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password as string}
            touched={touched.password as boolean}
            required={!initialValues}
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

export default UserForm;
