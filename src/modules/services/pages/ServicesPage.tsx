import { ITButton, ITDialog, ITLoader } from "@axzydev/axzy_ui_system";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { showToast } from "@app/core/store/toast/toast.slice";
import ServiceForm from "../components/ServiceForm";
import { ServicesTable } from "../components/ServicesTable";
import {
  createService,
  deleteService,
  getAllServices,
  updateService,
} from "../services/ServiceService";
import { Service } from "../types/service.types";

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const dispatch = useDispatch();

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const servicesRes = await getAllServices();
      if (servicesRes?.data) setServices(servicesRes.data);
    } catch (error) {
      console.error("Error fetching services data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetchServices = async () => {
    try {
      const servicesRes = await getAllServices();
      if (servicesRes?.data) setServices(servicesRes.data);
    } catch (error) {
      console.error("Error refetching services", error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleSaveService = async (values: any) => {
    try {
      if (selectedService) {
        await updateService(selectedService.id, values);
        dispatch(showToast({ message: "Servicio actualizado", type: "success" }));
      } else {
        await createService(values);
        dispatch(showToast({ message: "Servicio registrado", type: "success" }));
      }
      setShowFormModal(false);
      setSelectedService(null);
      refetchServices();
    } catch (error: any) {
      dispatch(
        showToast({ message: error?.message || "Error al guardar servicio", type: "error" })
      );
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;
    try {
      await deleteService(selectedService.id);
      dispatch(showToast({ message: "Servicio eliminado", type: "success" }));
      setShowDeleteModal(false);
      setSelectedService(null);
      refetchServices();
    } catch (error: any) {
      dispatch(
        showToast({ message: error?.message || "Error al eliminar servicio", type: "error" })
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex flex-col gap-4 px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Catálogo de Servicios</h1>
          <ITButton
            label="Registrar Servicio"
            onClick={() => {
              setSelectedService(null);
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
            <ServicesTable 
                data={services} 
                onEdit={(row: Service) => {
                    setSelectedService(row);
                    setShowFormModal(true);
                }}
                onDelete={(row: Service) => {
                    setSelectedService(row);
                    setShowDeleteModal(true);
                }}
            />
        )}
      </div>

      {/* Service Form Modal */}
      <ITDialog
        isOpen={showFormModal}
        title={selectedService ? "Editar Servicio" : "Registrar Servicio"}
        onClose={() => {
          setShowFormModal(false);
          setSelectedService(null);
        }}
      >
        <ServiceForm 
          initialValues={selectedService} 
          onSubmit={handleSaveService} 
        />
      </ITDialog>

      {/* Delete Service Modal */}
      <ITDialog
        isOpen={showDeleteModal}
        title="Confirmar Eliminación"
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedService(null);
        }}
      >
        <div className="flex flex-col gap-4">
          <p>
            ¿Estás seguro que deseas eliminar el servicio{" "}
            <b>{selectedService?.name}</b>?
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
              onClick={handleDeleteService}
            />
          </div>
        </div>
      </ITDialog>
    </div>
  );
};

export default ServicesPage;
