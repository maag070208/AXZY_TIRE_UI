import { AppState } from "@app/core/store/store";
import { ITButton, ITDialog, ITLoader } from "axzy_ui_system";
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import AssignScheduleForm from "../components/AssignScheduleForm";
import ChildForm from "../components/ChildForm";
import ChildrenTable from "../components/ChildrenTable";
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

  const fetchChildren = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      console.log("ChildrenPage DEBUG: User Role:", user.role, "User ID:", user.id);
      if (user.role === "ADMIN") {
        console.log("Fetching ALL children");
        res = await getAllChildren();
      } else {
        if (user.id) {
            console.log("Fetching children for user", user.id);
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
        await createChild({ ...values, userId: user.id, birthDate: new Date(values.birthDate).toLocaleDateString("en-CA")});
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

    const handleAssignTraining = async (values: { trainingModeId: string; dayScheduleId: number }) => {
        if (!selectedChild) return;
        
        // Use the child's userId (the parent) for the assignment
        // This works for both Parents (assigning to own child) and Admins (assigning to another's child)
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
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mis Hijos</h1>
        <ITButton
          label="Agregar Hijo"
          onClick={() => {
            setSelectedChild(null);
            setShowFormModal(true);
          }}
        />
      </div>

      <ChildrenTable
        data={children}
        onRowClick={(child) => {
          setSelectedChild(child);
          setShowFormModal(true);
        }}
        onRowDelete={(child) => {
            setSelectedChild(child);
            setShowDeleteModal(true);
        }}
        onAssignTraining={(child) => {
            setSelectedChild(child);
            setShowAssignModal(true);
        }}
        onViewReports={(child) => {
            setSelectedChild(child);
            setShowReportsModal(true);
        }}
      />

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
          <AssignScheduleForm onSubmit={handleAssignTraining} />
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
