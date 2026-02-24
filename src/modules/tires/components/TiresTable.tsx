import { ITBadget, ITButton, ITTable } from "@axzydev/axzy_ui_system";
import { FaEdit, FaTrash } from "react-icons/fa";
import { TireType } from "../types/tire.types";

interface TiresTableProps {
  data: any[];
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
}

export const TiresTable = ({ data, onEdit, onDelete }: TiresTableProps) => {

  const getTypeColor = (type: TireType) => {
    switch (type) {
      case "NUEVA":
        return "success";
      case "SEMINUEVA":
        return "warning";
      case "GALLITO":
        return "tertiary";
      default:
        return "primary";
    }
  };

  const getStockColor = (stock: number, minStock: number) => {
    if (stock <= 0) return "danger";
    if (stock <= minStock) return "warning";
    return "success";
  };

  return (
    <ITTable
      columns={[
        {
          key: "brand",
          label: "Marca",
          type: "string",
          filter: true,
        },
        {
          key: "model",
          label: "Modelo / Diseño",
          type: "string",
          filter: true,
        },
        {
          key: "size",
          label: "Medida",
          type: "string",
          filter: true,
        },
        {
          key: "type",
          label: "Tipo",
          type: "string",
          filter: 'catalog',
          catalogOptions: {
            data: [
              { id: "NUEVA", name: "Nueva" },
              { id: "SEMINUEVA", name: "Seminueva" },
              { id: "GALLITO", name: "Gallito" },
            ],
          },
          render: (row: any) => (
            <ITBadget
              color={getTypeColor(row.type) as any}
              label={row.type}
            />
          ),
        },
        {
          key: "currentStock",
          label: "Stock",
          type: "string",
          filter: true,
          render: (row: any) => (
            <ITBadget
              color={getStockColor(row.currentStock, row.minStock)}
              label={`${row.currentStock} uds`}
            />
          ),
        },
        {
          key: "price",
          label: "Precio",
          type: "string",
          filter: false,
          render: (row: any) => (
            <span className="font-semibold text-gray-700">
               ${row.price?.toFixed(2)}
            </span>
          )
        },
        {
          key: "location",
          label: "Ubicación",
          type: "string",
          filter: true,
          render: (row: any) => (
              <span>{row.location?.name || 'Sin Asignar'}</span>
          )
        },
        {
          key: "actions",
          label: "Acciones",
          type: "actions",
          render: (row: any) => (
            <div className="flex gap-2">
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
