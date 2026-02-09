import { showToast } from "@app/core/store/toast/toast.slice";
import { ITButton, ITDialog } from "axzy_ui_system";
import { useCallback, useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaDollarSign,
  FaDumbbell,
  FaFilter,
  FaInfoCircle,
  FaPencilAlt,
  FaSearch,
  FaTimes,
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
  
  // Filter States
  const [filterText, setFilterText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'active', 'inactive'
  const [showFilters, setShowFilters] = useState(false);

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

  // Filter Logic
  const hasFilters = filterText || filterStatus !== 'all';

  const clearFilters = () => {
      setFilterText("");
      setFilterStatus("all");
  };

  const filteredModes = trainingModes.filter(mode => {
      const nameMatch = mode.name.toLowerCase().includes(filterText.toLowerCase()) || 
                       (mode.description && mode.description.toLowerCase().includes(filterText.toLowerCase()));
      
      let statusMatch = true;
      if (filterStatus === 'active') statusMatch = mode.isActive;
      if (filterStatus === 'inactive') statusMatch = !mode.isActive;

      return nameMatch && statusMatch;
  });

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex flex-col gap-4 px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
            Modos de Entrenamiento
            </h1>
            <div className="flex items-center gap-2">
                <button 
                    className="md:hidden flex items-center gap-2 text-indigo-600 font-medium text-sm bg-indigo-50 px-3 py-1.5 rounded-lg"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <FaFilter /> {showFilters ? 'Ocultar' : 'Filtrar'}
                </button>
                <ITButton
                label="Agregar"
                onClick={() => {
                    setSelectedMode(null);
                    setShowAddModal(true);
                }}
                className="shadow-md"
                />
            </div>
        </div>

        {/* Filters Grid */}
        <div className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-col gap-4 ${showFilters ? 'flex' : 'hidden'} md:flex`}>
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:block">Filtros de búsqueda</span>
                {hasFilters && (
                    <button 
                        onClick={clearFilters}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 ml-auto font-medium"
                    >
                        <FaTimes /> Limpiar filtros
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Text Filter */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Buscar por nombre o descripción..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>

                {/* Status Filter */}
                <div className="relative">
                     <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border bg-white"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="active">Activos</option>
                        <option value="inactive">Inactivos</option>
                    </select>
                </div>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModes.map((mode) => (
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
        
        {filteredModes.length === 0 && (
             <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                <FaDumbbell className="text-6xl mb-4 opacity-20" />
                <p>No se encontraron modos de entrenamiento.</p>
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
