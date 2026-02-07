import { showToast } from "@app/core/store/toast/toast.slice";
import { ITButton, ITDialog } from "axzy_ui_system";
import { useCallback, useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaDollarSign,
  FaDumbbell,
  FaInfoCircle,
  FaPencilAlt,
  FaTimesCircle,
  FaTrash,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import TrainingModeForm from "../components/TrainingModeForm";
import {
  createTrainingMode,
  deleteTrainingMode,
  getAllTrainingModes,
  updateTrainingMode,
} from "../services/TrainingModeService";

const TrainingModePage = () => {
  const [trainingModes, setTrainingModes] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState<any | null>(null);
  const dispatch = useDispatch();

  const fetchTrainingModes = useCallback(async () => {
    const response = await getAllTrainingModes().catch((error) => {
      console.error("Error fetching training modes:", error);
      return null;
    });

    if (response) {
      setTrainingModes(response.data);
    }
  }, []);

  const handleCreateMode = async (data: any) => {
    if (selectedMode) {
      const response = await updateTrainingMode(selectedMode.id, data).catch(
        (error) => {
          console.error("Error updating training mode:", error);
          return null;
        }
      );
      if (response) {
        setShowAddModal(false);
        setSelectedMode(null);
        fetchTrainingModes();
      }
    } else {
      const response = await createTrainingMode(data).catch((error) => {
        console.error("Error creating training mode:", error);
        return null;
      });

      if (response) {
        setShowAddModal(false);
        fetchTrainingModes();
      }
    }
  };

  const handleRemoveMode = async (id: string) => {
    const response = await deleteTrainingMode(id).catch((error: any) => {
      console.error("Error deleting training mode:", error);
      const messages = error?.messages;
      const message = Array.isArray(messages)
        ? messages[0]
        : "Error al eliminar";

      dispatch(
        showToast({
          type: "error",
          message: message,
        })
      );
      return null;
    });
    if (response) {
      dispatch(
        showToast({
          type: "success",
          message: "Modo de entrenamiento eliminado correctamente",
        })
      );
      fetchTrainingModes();
      setShowRemoveModal(false);
      setSelectedMode(null);
    }
  };

  useEffect(() => {
    fetchTrainingModes();
  }, [fetchTrainingModes]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800">
          Modos de Entrenamiento
        </h1>
        <ITButton
          label="Agregar"
          onClick={() => {
            setSelectedMode(null);
            setShowAddModal(true);
          }}
          className="shadow-md"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainingModes.map((mode) => (
          <div
            key={mode.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                <FaDumbbell className="text-xl" />
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                  mode.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {mode.isActive ? (
                  <>
                    <FaCheckCircle /> Activo
                  </>
                ) : (
                  <>
                    <FaTimesCircle /> Inactivo
                  </>
                )}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {mode.name}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 flex items-start gap-1">
                 <FaInfoCircle className="mt-0.5 flex-shrink-0" />
                 {mode.description}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-2">
                 <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                    <FaDollarSign />
                 </div>
                 <span className="text-lg font-bold text-gray-900">
                    {mode.coachCost}
                    <span className="text-xs font-normal text-gray-500 ml-1">MXN</span>
                 </span>
            </div>

            <div className="border-t border-gray-100 my-1"></div>

            <div className="flex items-center gap-3 mt-auto">
              <button
                onClick={() => {
                  setSelectedMode(mode);
                  setShowAddModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium text-sm border border-gray-200"
              >
                <FaPencilAlt />
                <span>Editar</span>
              </button>
              <button
                onClick={() => {
                  setSelectedMode(mode);
                  setShowRemoveModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium text-sm border border-red-100"
              >
                <FaTrash />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        ))}
        
        {trainingModes.length === 0 && (
             <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                <FaDumbbell className="text-6xl mb-4 opacity-20" />
                <p>No hay modos de entrenamiento registrados.</p>
             </div>
        )}
      </div></div>

      <ITDialog
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedMode(null);
        }}
        title={selectedMode ? "Editar Modo" : "Agregar Modo"}
      >
        <TrainingModeForm
          initialValues={selectedMode}
          onSubmit={(data) => {
            handleCreateMode(data);
          }}
        />
      </ITDialog>

      <ITDialog
        title="Confirmar eliminación"
        isOpen={showRemoveModal}
        onClose={() => {
          setShowRemoveModal(false);
          setSelectedMode(null);
        }}
        className="w-full max-w-md"
      >
        <p className="mb-6 text-gray-600">
          ¿Está seguro de eliminar el modo de entrenamiento: "
          <span className="font-bold text-gray-900">{selectedMode?.name}</span>
          "?
        </p>

        <div className="flex justify-end gap-3">
          <ITButton
            label="Cancelar"
            color="secondary"
            variant="outlined"
            onClick={() => setShowRemoveModal(false)}
          />
          <ITButton
            label="Eliminar"
            color="danger"
            onClick={() => {
              if (selectedMode) {
                  handleRemoveMode(selectedMode.id);
              }
            }}
          />
        </div>
      </ITDialog>
    </div>
  );
};

export default TrainingModePage;
