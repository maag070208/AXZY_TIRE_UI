import { ITBadget, ITButton, ITTable } from "@axzydev/axzy_ui_system";

export const UsersTable = ({
    data,
    onDelete,
    onEdit
}: {
    data: any,
    onDelete: (row: any) => void,
    onEdit: (row: any) => void
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
            return <ITBadget 
            color={
                row.role === "ADMIN" ? "primary" : row.role === "CAJERO" ? "success" : row.role === "TECNICO" ? "warning" : "secondary"
            }
            label={row.role} />
          }
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
                    <div className="flex gap-2">
                        <ITButton
                            label="Editar"
                            color="secondary"
                            onClick={() => onEdit(row)}
                        />
                        <ITButton
                            label="Eliminar"
                            color="gray"
                            onClick={() => onDelete(row)}
                        />
                    </div>
                )
            }
        }
      ]}
      data={data}
      defaultItemsPerPage={5}
      itemsPerPageOptions={[5, 10, 20]}
    />
  );
};
