import { ITBadget, ITButton, ITTable } from "@axzydev/axzy_ui_system";

import { FaEdit, FaTrash } from "react-icons/fa";

export const UsersTable = ({
  data,
  onDelete,
  onEdit,
}: {
  data: any;
  onDelete: (row: any) => void;
  onEdit: (row: any) => void;
}) => {
  return (
    <ITTable
      columns={[
        {
          key: "username",
          label: "Usuario",
          type: "string",
          filter: true,
        },
        {
          key: "name",
          label: "Nombre",
          type: "string",
          filter: true,
        },
        {
          key: "lastName",
          label: "Apellido",
          type: "string",
          filter: true,
        },
        {
          key: "role",
          label: "Rol",
          type: "string",
          filter: true,
          render: (row: any) => {
            return (
              <ITBadget
                color={
                  row.role === "ADMIN"
                    ? "primary"
                    : row.role === "CAJERO"
                      ? "success"
                      : row.role === "TECNICO"
                        ? "warning"
                        : "secondary"
                }
                label={row.role}
              />
            );
          },
        },
        {
          key: "isActive",
          label: "Activo",
          type: "boolean",
          filter: true,
        },
        {
          key: "actions",
          label: "Acciones",
          type: "actions",
          render: (row: any) => {
            return (
              <div className="flex justify-center gap-2">
                <ITButton
                  ariaLabel="Editar Servicio"
                  color="secondary"
                  variant="icon-only"
                  onClick={() => onEdit(row)}
                >
                  <FaEdit />
                </ITButton>
                <ITButton
                  ariaLabel="Eliminar Servicio"
                  color="primary"
                  variant="icon-only"
                  onClick={() => onDelete(row)}
                >
                  <FaTrash />
                </ITButton>
              </div>
            );
          },
        },
      ]}
      data={data}
      defaultItemsPerPage={5}
      itemsPerPageOptions={[5, 10, 20]}
    />
  );
};
