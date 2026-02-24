import dayjs from "dayjs";

export interface TicketItem {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface TicketTemplateProps {
  folio: number;
  date: string;
  cashierName: string;
  items: TicketItem[];
  total: number;
  paymentMethod: string;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
}

export const TicketTemplate = ({
  folio,
  date,
  cashierName,
  items,
  total,
  paymentMethod,
  businessName = "LLANTERA AXZY",
  businessAddress = "Blvd. Principal #123, Centro",
  businessPhone = "555-012-3456"
}: TicketTemplateProps) => {

  return (
    <div className="ticket">
      <div className="center mb-2">
        <div className="bold text-xl mb-1">{businessName}</div>
        <div className="mb-1">{businessAddress}</div>
        <div className="mb-1">Tel: {businessPhone}</div>
      </div>

      <div className="divider"></div>
      
      <div className="mb-1 mt-2">
        <span className="bold">Folio: </span> #{folio}
      </div>
      <div className="mb-1">
        <span className="bold">Fecha: </span> {dayjs(date).format("DD/MM/YYYY HH:mm")}
      </div>
      <div className="mb-2">
        <span className="bold">Cajero: </span> {cashierName}
      </div>

      <div className="divider"></div>

      <table className="mb-2 mt-2">
        <thead>
          <tr>
            <th style={{ width: "15%" }}>Cant</th>
            <th style={{ width: "55%" }}>Desc</th>
            <th style={{ width: "30%", textAlign: "right" }}>Importe</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td className="center">{item.quantity}</td>
              <td>{item.name}</td>
              <td className="right">${item.subtotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="divider"></div>

      <div className="mb-1 mt-2 flex" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="bold text-lg">TOTAL:</span>
        <span className="bold text-lg">${total.toFixed(2)}</span>
      </div>

      <div className="mb-4 flex" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Pago en:</span>
        <span>{paymentMethod}</span>
      </div>

      <div className="center mt-4 mb-4">
        <div>¡Gracias por su compra!</div>
        <div style={{ marginTop: '4px', fontSize: '9px' }}>Sistema de Venta AXZY</div>
      </div>
    </div>
  );
};
