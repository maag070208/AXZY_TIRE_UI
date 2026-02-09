import { AppState } from "@app/core/store/store";
import { ITButton, ITDialog, ITLoader } from "axzy_ui_system";
import { useCallback, useEffect, useState } from "react";
import {
  FaCalendarPlus,
  FaChartLine,
  FaPencilAlt,
  FaSearch,
  FaTrash,
  FaUser,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import AssignScheduleForm from "../components/AssignScheduleForm";
import ChildForm from "../components/ChildForm";
import EvaluationsList from "../components/EvaluationsList";
import {
  assignChildToTrainingMode,
  createChild,
  deleteChild,
  getAllChildren,
  getChildByUserId,
  updateChild,
} from "../service/ChildrenService";

const ChildrenPage = () => {
  const user = useSelector((state: AppState) => state.auth);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);

  const [selectedChild, setSelectedChild] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChildren = children.filter(child => 
    child.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    child.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchChildren = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      // console.log("ChildrenPage DEBUG: User Role:", user.role, "User ID:", user.id);
      if (user.role === "ADMIN") {
        res = await getAllChildren();
      } else {
        if (user.id) {
          res = await getChildByUserId(user.id);
        }
      }

      if (res?.data) {
        setChildren(res.data);
      }
    } catch (error) {
      console.error("Error fetching children", error);
    } finally {
      setLoading(false);
    }
  }, [user.id, user.role]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const handleSaveChild = async (values: any) => {
    try {
      if (selectedChild) {
        // Edit
        await updateChild(selectedChild.id, values);
      } else {
        // Create
        await createChild({
          ...values,
          userId: user.id,
          birthDate: new Date(values.birthDate).toLocaleDateString("en-CA"),
        });
      }
      setShowFormModal(false);
      setSelectedChild(null);
      fetchChildren();
    } catch (error) {
      console.error("Error saving child", error);
    }
  };

  const handleDeleteChild = async () => {
    if (!selectedChild) return;
    try {
      await deleteChild(selectedChild.id);
      setShowDeleteModal(false);
      setSelectedChild(null);
      fetchChildren();
    } catch (error) {
      console.error("Error deleting child", error);
    }
  };

  const handleAssignTraining = async (values: {
    trainingModeId: string;
    dayScheduleId: number;
  }) => {
    if (!selectedChild) return;

    // Use the child's userId (the parent) for the assignment
    const targetUserId = selectedChild.userId || user.id;

    try {
      await assignChildToTrainingMode({
        userId: Number(targetUserId),
        childId: selectedChild.id,
        trainingModeId: Number(values.trainingModeId),
        dayScheduleId: Number(values.dayScheduleId),
      });
      setShowAssignModal(false);
      setSelectedChild(null);
      fetchChildren();
    } catch (error) {
      console.error("Error assigning training", error);
    }
  };

  if (loading && children.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <ITLoader />
      </div>
    );
  }



  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex flex-col gap-4 px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
            {user.role === "ADMIN" ? "Alumnos" : "Mis Hijos"}
            </h1>
            <ITButton
            label="Agregar"
            onClick={() => {
                setSelectedChild(null);
                setShowFormModal(true);
            }}
            className="shadow-md"
            />
        </div>

        {/* Search Bar */}
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                placeholder={user.role === "ADMIN" ? "Buscar alumno por nombre..." : "Buscar hijo..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChildren.map((child) => {
          const hasAppointment =
            child.appointments && child.appointments.length > 0;
            
            // Calculate Age helper (optional but nice for mobile view)
            const age = new Date().getFullYear() - new Date(child.birthDate).getFullYear();


          return (
            <div
              key={child.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 relative overflow-hidden"
            >
              {/* Status Badge */}
              {hasAppointment && (
                <div className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-bl-xl">
                  Asignado
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                  <FaUser className="text-2xl" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-gray-900 leading-tight">
                    {child.name} {child.lastName}
                  </span>
                   <span className="text-sm text-gray-500 mt-1">
                    {new Date(child.birthDate).toLocaleDateString()} ({age} años)
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 my-1"></div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between gap-2 mt-auto">
                 <button
                    onClick={() => {
                        setSelectedChild(child);
                        setShowAssignModal(true);
                    }}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-colors text-indigo-600 hover:bg-indigo-50`}
                 >
                    <FaCalendarPlus className="text-xl" />
                    <span className="text-[10px] font-medium">Asignar</span>
                 </button>

                 <button
                    onClick={() => {
                        setSelectedChild(child);
                        setShowFormModal(true);
                    }}
                    className="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                 >
                    <FaPencilAlt className="text-lg" />
                    <span className="text-[10px] font-medium">Editar</span>
                 </button>

                 <button
                    onClick={() => {
                        setSelectedChild(child);
                        setShowReportsModal(true);
                    }}
                    className="flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-green-600 hover:bg-green-50 transition-colors"
                 >
                    <FaChartLine className="text-xl" />
                    <span className="text-[10px] font-medium">Reportes</span>
                 </button>

                 <button
                    onClick={() => {
                        setSelectedChild(child);
                        setShowDeleteModal(true);
                    }}
                    disabled={hasAppointment}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-colors ${
                        hasAppointment 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-red-500 hover:bg-red-50'
                    }`}
                 >
                    <FaTrash className="text-lg" />
                    <span className="text-[10px] font-medium">Eliminar</span>
                 </button>
              </div>
            </div>
          );
        })}
        
        {children.length === 0 && !loading && (
             <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                <FaUser className="text-6xl mb-4 opacity-20" />
                <p>No tienes hijos registrados aún.</p>
             </div>
        )}
      </div></div>

      {/* CREATE / EDIT MODAL */}
      <ITDialog
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedChild(null);
        }}
        title={selectedChild ? "Editar Hijo" : "Agregar Hijo"}
      >
        <ChildForm
          initialValues={selectedChild}
          onSubmit={handleSaveChild}
        />
      </ITDialog>

      {/* ASSIGN TRAINING MODAL */}
      <ITDialog
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedChild(null);
        }}
        title={`Asignar Entrenamiento a ${selectedChild?.name || ""}`}
      >
        <AssignScheduleForm 
            onSubmit={handleAssignTraining} 
            unavailableScheduleIds={selectedChild?.appointments?.map((a: any) => a.scheduleId) || []}
        />
      </ITDialog>

      {/* DELETE CONFIRM MODAL */}
      <ITDialog
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedChild(null);
        }}
        title="Confirmar Eliminación"
      >
        <div className="flex flex-col gap-4">
          <p>¿Estás seguro que deseas eliminar a {selectedChild?.name}?</p>
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
              onClick={handleDeleteChild}
            />
          </div>
        </div>
      </ITDialog>

      <ITDialog
        isOpen={showReportsModal}
        onClose={() => {
          setShowReportsModal(false);
          setSelectedChild(null);
        }}
        title={`Reportes de Evaluación - ${selectedChild?.name || ""}`}
        className="w-full max-w-2xl"
      >
        {selectedChild && <EvaluationsList childId={selectedChild.id} />}
      </ITDialog>
    </div>
  );
};

export default ChildrenPage;
