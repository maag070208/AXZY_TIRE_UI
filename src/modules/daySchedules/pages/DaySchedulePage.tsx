import { showToast } from "@app/core/store/toast/toast.slice";
import { convertToISODateTime } from "@app/core/utils/dateFormatter";
import { ITButton, ITDialog } from "axzy_ui_system";
import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaDumbbell,
  FaPencilAlt,
  FaTrash,
  FaUsers,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import DayScheduleForm from "../components/DayScheduleForm";
import {
  createDaySchedule,
  deleteDaySchedule,
  getAllDaySchedules,
  updateDaySchedule,
} from "../services/DayScheduleService";

const DaySchedulePage = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const dispatch = useDispatch();
  const fetchSchedules = useCallback(async () => {
    const response = await getAllDaySchedules().catch(() => null);
    if (response) setSchedules(response.data);
  }, []);

  const handleCreate = async (data: any) => {
    const body = {
      capacity: Number(data.capacity),
      date: new Date(data.date).toLocaleDateString("en-CA"),
      startTime: convertToISODateTime(data.date, data.startTime),
      endTime: convertToISODateTime(data.date, data.endTime),
      modeId: Number(data.modeId),
    };
    if (selected) {
      const response = await updateDaySchedule(selected.id, body);
      if (response) {
        setShowAddModal(false);
        setSelected(null);
        fetchSchedules();
      }
    } else {
      const response = await createDaySchedule(body);
      if (response) {
        setShowAddModal(false);
        fetchSchedules();
      }
    }
  };

  const handleDelete = async (id: number) => {
    const response = await deleteDaySchedule(id).catch((error) => {
      console.log(error);
      dispatch(showToast({
        message: error?.message || "Error al eliminar horario",
        type: "error",
      }));
    });
    if (response) fetchSchedules();
  };

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800">Horarios por Día</h1>
        <ITButton 
            label="Agregar" 
            onClick={() => setShowAddModal(true)} 
            className="shadow-md"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.map((item) => {
            const date = new Date(item.date);
            const formattedDate = `${date.getUTCDate().toString().padStart(2, "0")}/${(date.getUTCMonth() + 1).toString().padStart(2, "0")}/${date.getUTCFullYear()}`;
            
            const startTimeStr = new Date(item.startTime).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
            });
            const endTimeStr = new Date(item.endTime).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
            });
            
            const reserved = item.appointments ? item.appointments.length : 0;
            const capacity = item.capacity;
            const isFull = reserved >= capacity;
            const progress = Math.min((reserved / capacity) * 100, 100);

            return (
                <div 
                key={item.id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 relative overflow-hidden"
                >
                    {/* Status Badge */}
                    <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold ${
                        isFull ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                        {isFull ? 'LLENO' : 'DISPONIBLE'}
                    </div>

                    <div className="flex items-start gap-3 mt-2">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm flex-shrink-0">
                            <FaClock className="text-xl" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                {formattedDate}
                            </h3>
                            <span className="text-gray-500 font-medium text-sm">
                                {startTimeStr} - {endTimeStr}
                            </span>
                        </div>
                    </div>
                    
                    {/* Capacity Bar */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                            <span className="flex items-center gap-1"><FaUsers /> Ocupación</span>
                            <span>{reserved} / {capacity}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                    isFull ? 'bg-red-500' : 'bg-green-500'
                                }`} 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Mode Info */}
                    <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                        <FaDumbbell className="text-gray-400" />
                        <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Entrenamiento</p>
                                <p className="text-sm font-semibold text-gray-700">{item.mode.name}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 my-1"></div>

                    {/* Actions */}
                    <div className="flex gap-2">
                            <button
                            onClick={() => {
                                setSelected(item);
                                setShowAddModal(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium text-sm"
                        >
                            <FaPencilAlt />
                            <span>Editar</span>
                        </button>
                        <button
                            onClick={() => {
                                setSelected(item);
                                setShowRemoveModal(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium text-sm"
                        >
                            <FaTrash />
                            <span>Eliminar</span>
                        </button>
                    </div>
                </div>
            );
        })}
        
        {schedules.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                <FaCalendarAlt className="text-6xl mb-4 opacity-20" />
                <p>No hay horarios registrados.</p>
            </div>
        )}
        </div>
      </div>

      {/* ADD/EDIT */}
      <ITDialog
        isOpen={showAddModal}
        title={selected ? "Editar Horario" : "Agregar Horario"}
        onClose={() => {
          setSelected(null);
          setShowAddModal(false);
        }}
      >
        <DayScheduleForm initialValues={selected} onSubmit={handleCreate} />
      </ITDialog>

      {/* DELETE */}
      <ITDialog
        isOpen={showRemoveModal}
        title="Confirmar eliminación"
        onClose={() => {
          setSelected(null);
          setShowRemoveModal(false);
        }}
      >
        <p className="mb-4 text-gray-700">
          ¿Eliminar horario del{" "}
          <span className="font-bold">
            {selected?.date
              ? format(new Date(selected.date), "dd/MM/yyyy")
              : ""}
          </span>{" "}
          de{" "}
          <span className="font-bold">
            {selected?.startTime
              ? format(new Date(selected.startTime), "HH:mm")
              : ""}
          </span>{" "}
          a{" "}
          <span className="font-bold">
            {selected?.endTime
              ? format(new Date(selected.endTime), "HH:mm")
              : ""}
          </span>
          ?
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
              if (selected) handleDelete(selected.id);
              setShowRemoveModal(false);
            }}
          />
        </div>
      </ITDialog>
    </div>
  );
};

export default DaySchedulePage;
