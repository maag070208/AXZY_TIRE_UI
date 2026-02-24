import { ITBadget, ITButton, ITDialog, ITCard } from "@axzydev/axzy_ui_system";
import dayjs from "dayjs";
import { FaPrint } from "react-icons/fa";
import { SaleModel } from "../../pos/services/SalesService";
import { printComponent } from "@app/core/utils/print.utils";
import { TicketTemplate, TicketTemplateProps } from "./TicketTemplate";

interface SaleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleModel | null;
}

export const SaleDetailModal = ({
  isOpen,
  onClose,
  sale,
}: SaleDetailModalProps) => {
  if (!sale) return null;

  const renderTireItem = (item: any) => (
    <ITCard key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex-1">
        <p className="font-bold text-gray-900">{item.tire.brand} {item.tire.model}</p>
        <div className="flex gap-3 text-sm text-gray-500 mt-1">
          <span><span className="font-semibold">Medida:</span> {item.tire.size}</span>
          <span className="font-mono text-xs mt-0.5 px-1.5 py-0.5 bg-gray-100 rounded">SKU: {item.tire.sku}</span>
        </div>
      </div>
      <div className="flex items-center gap-6 text-right">
        <div>
           <p className="text-xs text-gray-400">P/U</p>
           <p className="font-semibold text-gray-700">${Number(item.unitPrice).toFixed(2)}</p>
        </div>
        <div>
           <p className="text-xs text-gray-400">Cant.</p>
           <p className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-center">{item.quantity}</p>
        </div>
        <div className="min-w-[80px]">
           <p className="text-xs text-gray-400">Subtotal</p>
           <p className="font-black text-blue-700">${Number(item.subtotal).toFixed(2)}</p>
        </div>
      </div>
    </ITCard>
  );

  const renderServiceItem = (item: any) => (
    <ITCard key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex-1">
        <p className="font-bold text-gray-900">{item.service.name}</p>
        <p className="text-sm text-gray-500 mt-1"><span className="font-semibold">Categoría:</span> {item.service.category || "General"}</p>
      </div>
      <div className="flex items-center gap-6 text-right">
        <div>
           <p className="text-xs text-gray-400">P/U</p>
           <p className="font-semibold text-gray-700">${Number(item.unitPrice).toFixed(2)}</p>
        </div>
        <div>
           <p className="text-xs text-gray-400">Cant.</p>
           <p className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-center">{item.quantity}</p>
        </div>
        <div className="min-w-[80px]">
           <p className="text-xs text-gray-400">Subtotal</p>
           <p className="font-black text-blue-700">${Number(item.subtotal).toFixed(2)}</p>
        </div>
      </div>
    </ITCard>
  );

  const handlePrint = () => {
    if (!sale) return;
    
    const items: TicketTemplateProps['items'] = [
      ...sale.tireItems.map(t => ({
        name: `${t.tire.brand} ${t.tire.model} ${t.tire.size}`,
        quantity: t.quantity,
        unitPrice: t.unitPrice,
        subtotal: t.subtotal
      })),
      ...sale.serviceItems.map(s => ({
        name: s.service.name,
        quantity: s.quantity,
        unitPrice: s.unitPrice,
        subtotal: s.subtotal
      }))
    ];

    printComponent(
      <TicketTemplate 
        folio={sale.id}
        date={sale.createdAt}
        cashierName={`${sale.user.name} ${sale.user.lastName}`}
        items={items}
        total={sale.total}
        paymentMethod={sale.paymentMethod}
      />,
      `Ticket_Venta_${sale.id}`
    );
  };

  let methodColor: "success" | "primary" | "warning" | "gray" = "gray";
  if (sale.paymentMethod === "EFECTIVO") methodColor = "success";
  if (sale.paymentMethod === "TARJETA") methodColor = "primary";
  if (sale.paymentMethod === "TRANSFERENCIA") methodColor = "warning";

  return (
    <ITDialog isOpen={isOpen} onClose={onClose} title={`Detalle de Venta #${sale.id}`}>
      <div className="flex flex-col gap-6 w-full lg:min-w-[800px]">
         
         <div className="flex justify-between items-start bg-gray-50 p-4 rounded-lg border border-gray-100">
             <div>
                <p className="text-sm text-gray-500">Fecha de Venta</p>
                <p className="font-bold text-gray-900">{dayjs(sale.createdAt).format("DD MMMM YYYY - hh:mm A")}</p>
             </div>
             <div>
                <p className="text-sm text-gray-500">Operador / Vendedor</p>
                <p className="font-bold text-gray-900">{sale.user?.name} {sale.user?.lastName}</p>
             </div>
             <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Método de Pago</p>
                <ITBadget label={sale.paymentMethod} color={methodColor} />
             </div>
         </div>

         {/* Llantas */}
         {sale.tireItems && sale.tireItems.length > 0 && (
             <div>
                 <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    Llantas Vendidas <ITBadget label={`${sale.tireItems.length}`} color="gray"/>
                 </h4>
                 <div className="flex flex-col gap-3">
                    {sale.tireItems.map(renderTireItem)}
                 </div>
             </div>
         )}

         {/* Servicios */}
         {sale.serviceItems && sale.serviceItems.length > 0 && (
             <div>
                 <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    Servicios Realizados <ITBadget label={`${sale.serviceItems.length}`} color="gray"/>
                 </h4>
                 <div className="flex flex-col gap-3">
                    {sale.serviceItems.map(renderServiceItem)}
                 </div>
             </div>
         )}

         <div className="flex justify-between items-center bg-gray-900 text-white p-5 rounded-lg shadow-inner mt-2">
            <div>
               <p className="text-gray-400 text-sm">Estado</p>
               <p className="font-bold text-green-400 uppercase tracking-widest">{sale.status}</p>
            </div>
            <div className="text-right">
               <p className="text-gray-400 text-sm">Cobro Total</p>
               <p className="text-4xl font-black">${sale.total.toFixed(2)}</p>
            </div>
         </div>

         <div className="flex justify-end gap-3 mt-4">
             <ITButton variant="outlined" color="primary" onClick={handlePrint}>
                <div className="flex items-center gap-2">
                   <FaPrint/> Imprimir Ticket
                </div>
             </ITButton>
             <ITButton label="Cerrar" onClick={onClose} />
         </div>
      </div>
    </ITDialog>
  );
};
