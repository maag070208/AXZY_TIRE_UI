import { ITButton, ITDialog, ITLoader } from "@axzydev/axzy_ui_system";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { showToast } from "@app/core/store/toast/toast.slice";
import LocationForm from "../components/LocationForm";
import { LocationsTable } from "../components/LocationsTable";
import {
  createLocation,
  deleteLocation,
  getAllLocations,
  updateLocation,
} from "../services/LocationService";
import { Location } from "../types/location.types";

const LocationsPage = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const dispatch = useDispatch();

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllLocations();
      if (res?.data) {
        setLocations(res.data);
      }
    } catch (error) {
      console.error("Error fetching locations", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleSaveLocation = async (values: any) => {
    try {
      if (selectedLocation) {
        await updateLocation(selectedLocation.id, values);
        dispatch(showToast({ message: "Ubicación actualizada", type: "success" }));
      } else {
        await createLocation(values);
        dispatch(showToast({ message: "Ubicación creada", type: "success" }));
      }
      setShowFormModal(false);
      setSelectedLocation(null);
      fetchLocations();
    } catch (error: any) {
      dispatch(
        showToast({ message: error?.message || "Error al guardar ubicación", type: "error" })
      );
    }
  };

  const handleDeleteLocation = async () => {
    if (!selectedLocation) return;
    try {
      await deleteLocation(selectedLocation.id);
      dispatch(showToast({ message: "Ubicación eliminada", type: "success" }));
      setShowDeleteModal(false);
      setSelectedLocation(null);
      fetchLocations();
    } catch (error: any) {
      dispatch(
        showToast({ message: error?.message || "Error al eliminar ubicación", type: "error" })
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex flex-col gap-4 px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Ubicaciones</h1>
          <ITButton
            label="Agregar"
            onClick={() => {
              setSelectedLocation(null);
              setShowFormModal(true);
            }}
            className="shadow-md"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loading ? (
             <div className="flex h-full items-center justify-center">
               <ITLoader />
             </div>
        ) : (
            <LocationsTable 
                data={locations} 
                onEdit={(row: Location) => {
                    setSelectedLocation(row);
                    setShowFormModal(true);
                }}
                onDelete={(row: Location) => {
                    setSelectedLocation(row);
                    setShowDeleteModal(true);
                }}
            />
        )}
      </div>

      {/* Location Form Modal */}
      <ITDialog
        isOpen={showFormModal}
        title={selectedLocation ? "Editar Ubicación" : "Crear Ubicación"}
        onClose={() => {
          setShowFormModal(false);
          setSelectedLocation(null);
        }}
      >
        <LocationForm initialValues={selectedLocation} onSubmit={handleSaveLocation} />
      </ITDialog>

      {/* Delete Location Modal */}
      <ITDialog
        isOpen={showDeleteModal}
        title="Confirmar Eliminación"
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedLocation(null);
        }}
      >
        <div className="flex flex-col gap-4">
          <p>
            ¿Estás seguro que deseas eliminar la ubicación{" "}
            <b>{selectedLocation?.name}</b>?
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
              onClick={handleDeleteLocation}
            />
          </div>
        </div>
      </ITDialog>
    </div>
  );
};

export default LocationsPage;
