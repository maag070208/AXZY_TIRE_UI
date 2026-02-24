import { ITBadget, ITButton, ITTable } from "@axzydev/axzy_ui_system";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";


interface LocationsTableProps {
  data: any[];
  onViewTires: (row: any) => void;
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
}

export const LocationsTable = ({ data, onViewTires, onEdit, onDelete }: LocationsTableProps) => {
  return (
    <ITTable
      columns={[
        {
          key: "name",
          label: "Nombre de Ubicación",
          type: "string",
          filter: true,
        },
        {
          key: "description",
          label: "Descripción",
          type: "string",
          filter: false,
        },
        {
          key: "aisle",
          label: "Pasillo",
          type: "string",
          filter: true,
        },
        {
          key: "level",
          label: "Nivel",
          type: "string",
          filter: true,
        },
        {
          key: "isActive",
          label: "Estado",
          type: "string",
          filter: true,
          render: (row: any) => (
            <ITBadget
              color={row.isActive ? "success" : "danger"}
              label={row.isActive ? "Activo" : "Inactivo"}
            />
          ),
        },
        {
          key: "actions",
          label: "Acciones",
          type: "actions",
          render: (row: any) => (
             <div className="flex gap-2">
                          <ITButton
                            ariaLabel="Ver Llantas"
                            color="primary"
                            variant="icon-only"
                            onClick={() => onViewTires(row)}
                          >
                            <FaEye />
                          </ITButton>
                          <ITButton
                            ariaLabel="Editar"
                            color="secondary"
                            variant="icon-only"
                            onClick={() => onEdit(row)}
                          >
                            <FaEdit />
                          </ITButton>
                          <ITButton
                            ariaLabel="Eliminar"
                            color="danger"
                            variant="icon-only"
                            onClick={() => onDelete(row)}
                          >
                            <FaTrash />
                          </ITButton>
                        </div>
          ),
        },
      ]}
      data={data}
      defaultItemsPerPage={10}
      itemsPerPageOptions={[5, 10, 20]}
    />
  );
};
