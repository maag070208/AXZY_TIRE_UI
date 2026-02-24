import { ITBadget, ITButton, ITTable } from "@axzydev/axzy_ui_system";
import dayjs from "dayjs";
import { FaEye } from "react-icons/fa";
import { SaleModel } from "../../pos/services/SalesService";

interface SalesTableProps {
  data: SaleModel[];
  onViewDetails: (sale: SaleModel) => void;
  isLoading?: boolean;
}

export const SalesTable = ({ data, onViewDetails, isLoading }: SalesTableProps) => {

  const getPaymentColor = (method: string) => {
    switch (method) {
      case "EFECTIVO":
        return "success";
      case "TARJETA":
        return "primary";
      case "TRANSFERENCIA":
        return "warning";
      default:
        return "gray";
    }
  };

  return (
    <ITTable
      columns={[
        {
          key: "id",
          label: "Folio",
          type: "string",
          filter: true,
          render: (row: SaleModel) => (
             <span className="font-mono font-bold text-gray-700">#{row.id}</span>
          )
        },
        {
          key: "createdAt",
          label: "Fecha",
          type: "string",
          filter: false,
          render: (row: SaleModel) => (
             <span>{dayjs(row.createdAt).format("DD/MM/YYYY hh:mm A")}</span>
          )
        },
        {
          key: "userName",
          label: "Operador",
          type: "string",
          filter: true,
          render: (row: SaleModel) => (
             <span>{row.user?.name} {row.user?.lastName}</span>
          )
        },
        {
          key: "paymentMethod",
          label: "Pago",
          type: "string",
          filter: 'catalog',
          catalogOptions: {
             data: [
                 { id: "EFECTIVO", name: "Efectivo" },
                 { id: "TARJETA", name: "Tarjeta" },
                 { id: "TRANSFERENCIA", name: "Transferencia" }
             ]
          },
          render: (row: SaleModel) => (
            <ITBadget
              color={getPaymentColor(row.paymentMethod) as any}
              label={row.paymentMethod}
            />
          ),
        },
        {
          key: "itemsCount",
          label: "Artículos",
          type: "string",
          filter: false,
          render: (row: SaleModel) => {
             const tiresItems = row.tireItems.reduce((acc, curr) => acc + curr.quantity, 0);
             const srvItems = row.serviceItems.reduce((acc, curr) => acc + curr.quantity, 0);
             return <span>{tiresItems + srvItems} items</span>;
          }
        },
        {
          key: "total",
          label: "Total Acumulado",
          type: "string",
          filter: false,
          render: (row: SaleModel) => (
             <span className="font-bold text-green-700">${Number(row.total).toFixed(2)}</span>
          )
        },
        {
          key: "actions",
          label: "Acciones",
          type: "actions",
          render: (row: SaleModel) => (
            <div className="flex gap-2">
              <ITButton
                ariaLabel="Ver Detalles"
                color="secondary"
                variant="icon-only"
                onClick={() => onViewDetails(row)}
              >
                <FaEye />
              </ITButton>
            </div>
          ),
        },
      ]}
      data={data.map(d => ({...d, userName: `${d.user?.name} ${d.user?.lastName}`}))}
      defaultItemsPerPage={20}
      itemsPerPageOptions={[10, 20, 50]}
    />
  );
};
