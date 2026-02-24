import { ITLoader, ITTable, ITDialog, ITBadget } from "@axzydev/axzy_ui_system";
import { useEffect, useState } from "react";
import { getAllTires } from "../../tires/services/TireService";
import { Tire } from "../../tires/types/tire.types";

interface LocationTiresModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationId?: number;
  locationName?: string;
}

export const LocationTiresModal = ({ isOpen, onClose, locationId, locationName }: LocationTiresModalProps) => {
  const [tires, setTires] = useState<Tire[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && locationId) {
      fetchTires(locationId);
    } else {
      setTires([]);
    }
  }, [isOpen, locationId]);

  const fetchTires = async (locId: number) => {
    setLoading(true);
    try {
      const res = await getAllTires();
      if (res?.data) {
        // Filter locally by location ID
        const locationTires = res.data.filter((t: Tire) => t.locationId === locId);
        setTires(locationTires);
      }
    } catch (error) {
      console.error("Error fetching tires for location", error);
    } finally {
      setLoading(false);
    }
  };

  const getStockColor = (stock: number, minStock: number) => {
    if (stock <= 0) return "danger";
    if (stock <= minStock) return "warning";
    return "success";
  };

  return (
    <ITDialog isOpen={isOpen} onClose={onClose} title={`Llantas en: ${locationName || 'Ubicación'}`}>
      <div className="w-full lg:min-w-[700px] flex flex-col gap-4">
        {loading ? (
           <div className="flex w-full items-center justify-center p-8">
             <ITLoader />
           </div>
        ) : (
           tires.length === 0 ? (
              <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                 No hay llantas registradas físicamente en esta ubicación.
              </div>
           ) : (
             <div className="max-h-[60vh] overflow-y-auto">
                <ITTable
                   columns={[
                     { key: "brand", label: "Marca", type: "string", filter: true },
                     { key: "model", label: "Modelo", type: "string" },
                     { key: "size", label: "Medida", type: "string", filter: true },
                     { 
                        key: "type", label: "Tipo", type: "string",
                        render: (row: any) => (
                          <span className="text-sm font-semibold text-gray-600">{row.type}</span>
                        )
                     },
                     {
                        key: "currentStock", label: "Stock", type: "string",
                        render: (row: any) => (
                           <ITBadget
                              color={getStockColor(row.currentStock, row.minStock)}
                              label={`${row.currentStock} uds`}
                           />
                        )
                     }
                   ]}
                   data={tires}
                   defaultItemsPerPage={5}
                   itemsPerPageOptions={[5, 10, 20]}
                />
             </div>
           )
        )}
      </div>
    </ITDialog>
  );
};
