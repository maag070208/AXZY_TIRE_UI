import { ITBadget, ITButton, ITTable } from "@axzydev/axzy_ui_system";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Service } from "../types/service.types";

interface ServicesTableProps {
  data: Service[];
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}

export const ServicesTable = ({ data, onEdit, onDelete }: ServicesTableProps) => {
  const columns = [
    {
      key: "name",
      label: "Nombre",
      type: "text",
      filter: true,
      sort: true,
    },
    {
      key: "category",
      label: "Categoría",
      type: "text",
      filter: true,
      sort: true,
      render: (row: any) => row.category || "General",
    },
    {
      key: "basePrice",
      label: "Precio Base",
      type: "number",
      sort: true,
      render: (row: any) => `$${row.basePrice.toFixed(2)}`,
    },
    {
      key: "description",
      label: "Descripción",
      type: "text",
      filter: false,
    },
    {
      key: "isActive",
      label: "Estatus",
      type: "boolean",
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
      ),
    },
  ];

  return (
        <ITTable
          columns={columns as any}
          data={data as any}
        />
  );
};
