import { ITButton, ITDialog, ITLoader } from "@axzydev/axzy_ui_system";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { showToast } from "@app/core/store/toast/toast.slice";
import { Location } from "../../locations/types/location.types";
import { getAllLocations } from "../../locations/services/LocationService";
import TireForm from "../components/TireForm";
import { TiresTable } from "../components/TiresTable";
import {
  bulkCreateTires,
  createTire,
  deleteTire,
  getAllTires,
  updateTire,
} from "../services/TireService";
import { Tire } from "../types/tire.types";
import { TireBulkUploadModal } from "../components/TireBulkUploadModal";

const TiresPage = () => {
  const [tires, setTires] = useState<Tire[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedTire, setSelectedTire] = useState<Tire | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const dispatch = useDispatch();

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [tiresRes, locRes] = await Promise.all([
        getAllTires(),
        getAllLocations()
      ]);
      if (tiresRes?.data) setTires(tiresRes.data);
      if (locRes?.data) setLocations(locRes.data);
    } catch (error) {
      console.error("Error fetching initial data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetchTires = async () => {
    try {
      const tiresRes = await getAllTires();
      if (tiresRes?.data) setTires(tiresRes.data);
    } catch (error) {
      console.error("Error refetching tires", error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleSaveTire = async (values: any) => {
    try {
      if (selectedTire) {
        await updateTire(selectedTire.id, values);
        dispatch(showToast({ message: "Llanta actualizada", type: "success" }));
      } else {
        await createTire(values);
        dispatch(showToast({ message: "Llanta registrada", type: "success" }));
      }
      setShowFormModal(false);
      setSelectedTire(null);
      refetchTires();
    } catch (error: any) {
      dispatch(
        showToast({ message: error?.message || "Error al guardar llanta", type: "error" })
      );
    }
  };

  const handleBulkUpload = async (data: any[]) => {
    setLoading(true);
    try {
      await bulkCreateTires(data);
      dispatch(showToast({ message: `¡Se insertaron/actualizaron las llantas correctamente!`, type: "success" }));
      setShowBulkModal(false);
      refetchTires();
    } catch (error: any) {
       dispatch(
        showToast({ message: error?.message || "Error al importar el archivo", type: "error" })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTire = async () => {
    if (!selectedTire) return;
    try {
      await deleteTire(selectedTire.id);
      dispatch(showToast({ message: "Registro eliminado", type: "success" }));
      setShowDeleteModal(false);
      setSelectedTire(null);
      refetchTires();
    } catch (error: any) {
      dispatch(
        showToast({ message: error?.message || "Error al eliminar llanta", type: "error" })
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex flex-col gap-4 px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Inventario Llantas</h1>
          <div className="flex gap-4">
             <ITButton
                label="Carga Masiva (Excel)"
                color="secondary"
                variant="outlined"
                onClick={() => setShowBulkModal(true)}
             />
             <ITButton
                label="Registrar Llanta"
                onClick={() => {
                setSelectedTire(null);
                setShowFormModal(true);
                }}
                className="shadow-md"
             />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loading ? (
             <div className="flex h-full items-center justify-center">
               <ITLoader />
             </div>
        ) : (
            <TiresTable 
                data={tires} 
                onEdit={(row: Tire) => {
                    setSelectedTire(row);
                    setShowFormModal(true);
                }}
                onDelete={(row: Tire) => {
                    setSelectedTire(row);
                    setShowDeleteModal(true);
                }}
            />
        )}
      </div>

      {/* Tire Form Modal */}
      <ITDialog
        isOpen={showFormModal}
        title={selectedTire ? "Editar Llanta" : "Registrar Llanta"}
        onClose={() => {
          setShowFormModal(false);
          setSelectedTire(null);
        }}
      >
        <TireForm 
          initialValues={selectedTire} 
          onSubmit={handleSaveTire} 
          locations={locations} 
        />
      </ITDialog>

      {/* Bulk Upload Modal */}
      <ITDialog
        isOpen={showBulkModal}
        title="Carga Masiva de Llantas"
        onClose={() => setShowBulkModal(false)}
      >
        <TireBulkUploadModal 
          onUpload={handleBulkUpload} 
          isLoading={loading} 
        />
      </ITDialog>

      {/* Delete Tire Modal */}
      <ITDialog
        isOpen={showDeleteModal}
        title="Confirmar Eliminación"
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTire(null);
        }}
      >
        <div className="flex flex-col gap-4">
          <p>
            ¿Estás seguro que deseas eliminar el registro de la llanta{" "}
            <b>{selectedTire?.brand} {selectedTire?.model} ({selectedTire?.size})</b>?
          </p>
          <div className="flex justify-end gap-2">
            <ITButton
              label="Cancelar"
              variant="outlined"
              color="secondary"
              onClick={() => setShowDeleteModal(false)}
            />
            <ITButton
              label="Eliminar"
              color="danger"
              onClick={handleDeleteTire}
            />
          </div>
        </div>
      </ITDialog>
    </div>
  );
};

export default TiresPage;
