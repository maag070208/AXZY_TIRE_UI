import { ITButton, ITInput } from "@axzydev/axzy_ui_system";
import dayjs from "dayjs";
import { useEffect, useState, useMemo } from "react";
import { FaFileInvoiceDollar, FaSearch } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { getSales, SaleModel } from "../../pos/services/SalesService";
import { SaleDetailModal } from "../components/SaleDetailModal";
import { SalesTable } from "../components/SalesTable";
import { showToast } from "@app/core/store/toast/toast.slice";

const SalesPage = () => {
  const dispatch = useDispatch();

  const [sales, setSales] = useState<SaleModel[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [globalFilter, setGlobalFilter] = useState("");

  const [selectedSale, setSelectedSale] = useState<SaleModel | null>(null);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const res = await getSales(startDate, endDate);
      if (res.data) {
        setSales(res.data);
      } else {
        setSales([]);
      }
    } catch (error: any) {
      dispatch(
        showToast({
          message: "Error al cargar historial de ventas.",
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchSalesData();
    }
  }, [startDate, endDate]);

  const totalSalesAmount = useMemo(() => {
    return sales.reduce((acc, sale) => acc + sale.total, 0);
  }, [sales]);

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FaFileInvoiceDollar className="text-blue-600" /> Historial de Ventas
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Consulta y audita todas las notas de venta generadas en el Punto de Venta.
              </p>
            </div>
            {/* Quick Stats Summary */}
            <div className="flex gap-4">
               <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 min-w-[150px] shadow-sm">
                  <span className="text-blue-600 text-sm font-bold block mb-1">Total Ingresos</span>
                  <span className="text-2xl font-black text-blue-900">${totalSalesAmount.toFixed(2)}</span>
               </div>
               <div className="bg-green-50 border border-green-100 rounded-xl p-4 min-w-[120px] shadow-sm">
                  <span className="text-green-600 text-sm font-bold block mb-1">Notas Cobradas</span>
                  <span className="text-2xl font-black text-green-900">{sales.length} <span className="text-sm font-medium opacity-60">tickets</span></span>
               </div>
            </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="flex-1">
                <ITInput
                  name="startDate"
                  label="Fecha Inicio (Desde)"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  onBlur={() => {}}
                />
            </div>
            <div className="flex-1">
                <ITInput
                  name="endDate"
                  label="Fecha Fin (Hasta)"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  onBlur={() => {}}
                />
            </div>
          </div>
          <div className="w-full md:w-[350px] relative">
            <ITInput
              name="search"
              placeholder="Buscar por folio, operador..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              onBlur={() => {}}
            />
            <FaSearch className="absolute right-4 top-1/2 -translate-y-[20%] text-gray-400 pointer-events-none" />
          </div>
          <div className="lg:w-[200px]">
             <ITButton label="Aplicar Filtros" onClick={fetchSalesData} color="primary" className="w-full justify-center py-2.5" disabled={loading} />
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        {sales.length === 0 && !loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <FaSearch className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              No se encontraron ventas
            </h3>
            <p className="text-center max-w-sm">
              No hay registros de ventas para el rango de fechas seleccionado.
              Intenta con un filtro diferente.
            </p>
          </div>
        ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden">
               <SalesTable 
                  data={sales} 
                  onViewDetails={setSelectedSale} 
                  isLoading={loading} 
               />
            </div>
        )}
      </div>

      {/* Detail Modal */}
      <SaleDetailModal
        isOpen={!!selectedSale}
        onClose={() => setSelectedSale(null)}
        sale={selectedSale}
      />
    </div>
  );
};

export default SalesPage;
