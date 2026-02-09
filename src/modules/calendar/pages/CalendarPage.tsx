import { AppState } from "@app/core/store/store";
import { showToast } from "@app/core/store/toast/toast.slice";
import { ITButton, ITCalendar, ITDialog, ITLoader, ITSelect } from "axzy_ui_system";
import { format, parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteAppointment } from "../../appointments/service/AppointmentService";
import { assignChildToTrainingMode, getAllChildren, getChildByUserId } from "../../children/service/ChildrenService";
import { createDaySchedule, deleteDaySchedule, getAllDaySchedules } from "../../daySchedules/services/DayScheduleService";
import { getAllTrainingModes } from "../../traningMode/services/TrainingModeService";
import { User as CoachUser, getCoaches } from "../../users/services/UserService";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  color?: string;
  data?: any;
}

const CalendarPage = () => {
    const user = useSelector((state: AppState) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [trainingModes, setTrainingModes] = useState<any[]>([]);
    const [daySchedules, setDaySchedules] = useState<any[]>([]);
    const [children, setChildren] = useState<any[]>([]);
    const [coaches, setCoaches] = useState<CoachUser[]>([]);
    
    const [selectedModeId, setSelectedModeId] = useState<string>("");
    const [loading, setLoading] = useState(false);

    // Dialog State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [selectedChildId, setSelectedChildId] = useState<string>("");

    // Responsive State
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initial Fetch
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [modesRes, schedulesRes] = await Promise.all([
                    getAllTrainingModes(),
                    getAllDaySchedules()
                ]);

                if (user?.role === "ADMIN") {
                     // Admin fetches ALL children and Coaches
                     const [allChildrenRes, coachesRes] = await Promise.all([
                         getAllChildren(),
                         getCoaches()
                     ]);
                     
                     if (allChildrenRes.data) setChildren(allChildrenRes.data);
                     if (coachesRes.data) setCoaches(coachesRes.data);

                } else if (user?.id) {
                    // Fetch children for regular user (or coach acting as parent?)
                    // Coach role behavior regarding children isn't specified, assuming same as user for now.
                    const childrenRes = await getChildByUserId(Number(user.id));
                    if (childrenRes.data) {
                        setChildren(childrenRes.data);
                    }
                }
                
                if (modesRes.data) {
                    setTrainingModes(modesRes.data);
                    if (modesRes.data.length > 0) {
                        setSelectedModeId(String(modesRes.data[0].id));
                    }
                }
                if (schedulesRes.data) {
                    setDaySchedules(schedulesRes.data);
                }
            } catch (error) {
                console.error("Error fetching calendar data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.id, user?.role]);

    const handleAssign = async () => {
        if (!selectedEvent || !selectedChildId) return;

        // Find the selected child to get their userId
        const childToAssign = children.find(c => String(c.id) === selectedChildId);
        if (!childToAssign) return;

        setLoading(true);
        try {
            await assignChildToTrainingMode({
                userId: Number(childToAssign.userId), // Use the child's parent ID
                childId: Number(selectedChildId),
                dayScheduleId: Number(selectedEvent.id),
                trainingModeId: Number(selectedModeId)
            });
            
            dispatch(showToast({ type: "success", message: "Inscrito correctamente" }));
            setShowAssignModal(false);
            setSelectedChildId("");
            setSelectedEvent(null);
            
            const schedulesRes = await getAllDaySchedules();
            if (schedulesRes.data) setDaySchedules(schedulesRes.data);

        } catch (error: any) {
            console.error("Error assigning child:", error);
            dispatch(showToast({ type: "error", message: error?.message || "Error al inscribir" }));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedEvent) return;
        if (!confirm("¿Estás seguro de que deseas eliminar este horario? Esta acción no se puede deshacer.")) return;

        setLoading(true);
        try {
            await deleteDaySchedule(Number(selectedEvent.id));
            dispatch(showToast({ type: "success", message: "Horario eliminado correctamente" }));
            setShowAssignModal(false);
            setSelectedEvent(null);
            
            const schedulesRes = await getAllDaySchedules();
            if (schedulesRes.data) setDaySchedules(schedulesRes.data);
        } catch (error: any) {
            console.error("Error deleting schedule:", error);
            dispatch(showToast({ type: "error", message: error?.message || "Error al eliminar" }));
        } finally {
            setLoading(false);
        }
    };

    const handleUnenroll = async (appointmentId: number) => {
        if (!confirm("¿Estás seguro de que deseas dar de baja a este alumno?")) return;
        
        setLoading(true);
        try {
            await deleteAppointment(appointmentId);
            dispatch(showToast({ type: "success", message: "Alumno dado de baja correctamente" }));
            
            const schedulesRes = await getAllDaySchedules();
            if (schedulesRes.data) {
                setDaySchedules(schedulesRes.data);
                const updatedSchedule = schedulesRes.data.find((s: any) => String(s.id) === selectedEvent?.id);
                if (updatedSchedule && selectedEvent) {
                     setSelectedEvent({
                         ...selectedEvent,
                         data: updatedSchedule
                     });
                }
            }

        } catch (error: any) {
             console.error("Error unenroll child:", error);
             dispatch(showToast({ type: "error", message: error?.message || "Error al dar de baja" }));
        } finally {
            setLoading(false);
        }
    };

    // ... (Memoized events logic remains same)
    const events = useMemo(() => {
        if (!selectedModeId) return [];
        const filteredSchedules = daySchedules.filter(s => s.modeId === Number(selectedModeId));
        const calendarEvents: CalendarEvent[] = [];

        filteredSchedules.forEach(schedule => {
            try {
                const start = typeof schedule.startTime === 'string' ? parseISO(schedule.startTime) : new Date(schedule.startTime);
                const end = typeof schedule.endTime === 'string' ? parseISO(schedule.endTime) : new Date(schedule.endTime);

                if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

                const available = schedule.capacity - (schedule.appointments?.length || 0);
                const isFull = available <= 0;

                calendarEvents.push({
                    id: schedule.id.toString(),
                    title: isFull ? "LLENO" : `Disponible (${available})`, 
                    start,
                    end,
                    color: isFull ? "#ef4444" : "#2563eb",
                    data: schedule
                });

            } catch (e) {
                console.warn("Failed to parse schedule", schedule, e);
            }
        });

        return calendarEvents;
    }, [daySchedules, selectedModeId]);

    const handleSlotClick = (date: Date) => {
        if (user?.role === "ADMIN" || user?.role === "COACH") {
             // Default to 30 minutes slot on click (Admin or Coach)
             const end = new Date(date);
             end.setMinutes(end.getMinutes() + 30);
             handleSelectRange(date, end);
        }
    };

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setSelectedChildId("");
        setShowAssignModal(true);
    };

    // Creation Dialog State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createData, setCreateData] = useState<{start: Date | null, end: Date | null, capacity: number, coachId: string}>({ 
        start: null, end: null, capacity: 10, coachId: ""
    });
    
    // Recurrence State
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringUntil, setRecurringUntil] = useState<Date | null>(null);
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    
    const WEEK_DAYS = [
        { label: 'D', value: 0 },
        { label: 'L', value: 1 },
        { label: 'M', value: 2 },
        { label: 'X', value: 3 },
        { label: 'J', value: 4 },
        { label: 'V', value: 5 },
        { label: 'S', value: 6 },
    ];

    const handleSelectRange = (start: Date, end: Date) => {
        console.log("Selected range:", start, end);
        if (user?.role !== "ADMIN" && user?.role !== "COACH") return;
        
        // If Coach, auto-select self
        let initialCoachId = "";
        if (user?.role === "COACH") {
            initialCoachId = String(user.id);
        }

        setCreateData({ start, end, capacity: 10, coachId: initialCoachId });
        
        // Reset recurrence defaults
        setIsRecurring(false);
        setRecurringUntil(null);
        setSelectedDays([start.getDay()]); // Auto-select the clicked day

        setShowCreateModal(true);
    };



    return (
        <div className="flex flex-col h-full bg-gray-50 h-max">
             {/* Header Section */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 bg-gray-50 shrink-0">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-800">Calendario de Entrenamientos</h1>
                </div>
                
                <div className="w-full md:w-72">
                     <ITSelect
                        name="trainingMode"
                        label="Modo de Entrenamiento"
                        options={trainingModes.map(m => ({ label: m.name, value: String(m.id) }))}
                        value={selectedModeId}
                        onChange={(e) => setSelectedModeId(e.target.value)}
                        placeholder="Seleccionar modo..."
                     />
                </div>
            </div>

            {/* Calendar Conatiner */}
            <div className="flex-1 overflow-hidden px-4 md:px-6 pb-4 md:pb-6 relative ">
                 <div className="h-full w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative flex flex-col">
                    {loading && (
                        <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center backdrop-blur-sm">
                            <ITLoader />
                        </div>
                    )}
                    
                        <ITCalendar 
                            events={events}
                            onSlotClick={handleSlotClick}
                            onEventClick={handleEventClick}
                            onSelectRange={handleSelectRange}
                            mode={isMobile ? 'week' : 'week'}
                            className="border-0 rounded-none shadow-none h-full"
                        />
                </div>
            </div>

            {/* ASSIGNMENT DIALOG */}
            <ITDialog
                isOpen={showAssignModal}
                title={user?.role === "ADMIN" ? "Gestionar Inscripciones" : "Inscribir a Clase"}
                onClose={() => setShowAssignModal(false)}
                className="w-full max-w-md"
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800 font-semibold">Detalles del Horario:</p>
                        <p className="text-gray-700">
                             Fecha: {selectedEvent?.start ? format(new Date(selectedEvent.start), 'dd/MM/yyyy') : '-'}
                        </p>
                        <p className="text-gray-700">
                             Hora: {selectedEvent?.start ? format(new Date(selectedEvent.start), 'HH:mm') : '-'} - {selectedEvent?.end ? format(new Date(selectedEvent.end), 'HH:mm') : '-'}
                        </p>
                        {selectedEvent?.data?.coach && (
                            <p className="text-gray-700 font-medium">
                                Entrenador: {selectedEvent.data.coach.name} {selectedEvent.data.coach.lastName}
                            </p>
                        )}
                    </div>
                    
                    {/* ENROLLMENT LIST (Admin/Coach: All, Parent: Own Children) */}
                    {(() => {
                        const appointments = selectedEvent?.data?.appointments || [];
                        const isCoach = user?.role === "COACH";
                        const isAdmin = user?.role === "ADMIN";
                        
                        // Coach and Admin see all
                        const visibleAppointments = (isAdmin || isCoach)
                            ? appointments 
                            : appointments.filter((appt: any) => children.some(c => c.id === appt.child.id));

                        if (visibleAppointments.length === 0 && !isAdmin && !isCoach) return null;

                        return (selectedEvent?.data?.appointments && (
                            <div className="border rounded-md p-3">
                                <p className="text-sm font-bold mb-2">
                                    {(isAdmin || isCoach) ? `Inscritos (${appointments.length}):` : "Tus Hijos Inscritos:"}
                                </p>
                                {visibleAppointments.length === 0 ? (
                                    <p className="text-sm text-gray-500">No hay inscritos.</p>
                                ) : (
                                    <ul className="text-sm space-y-2 mt-2">
                                        {visibleAppointments.map((appt: any) => (
                                            <li key={appt.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                <span>- {appt.child?.name} {appt.child?.lastName}</span>
                                                <div className="flex gap-2">
                                                    {isCoach && (
                                                        <ITButton 
                                                            label="Evaluar"
                                                            color="success"
                                                            onClick={() => {
                                                                // window.location.href = `/evaluations/new?childId=${appt.child.id}`;
                                                                navigate(`/evaluations/new?childId=${appt.child.id}`);
                                                            }}
                                                        />
                                                    )}
                                                    {/* Only Admin or Parent (for their own kid) can delete. Coach CANNOT. */}
                                                    {!isCoach && (
                                                        <button 
                                                            onClick={() => handleUnenroll(appt.id)}
                                                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                            title="Dar de baja"
                                                        >
                                                            <FaTrash size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ));
                    })()}

                    {/* ONLY SHOW ENROLLMENT INPUT IF NOT COACH */}
                    {user?.role !== "COACH" && (
                        <>
                            <ITSelect
                                label={user?.role === "ADMIN" ? "Inscribir Alumno" : "Seleccionar Hijo"}
                                name="childId"
                                options={children.map(c => ({ label: `${c.name} ${c.lastName}`, value: String(c.id) }))}
                                value={selectedChildId}
                                onChange={(e) => setSelectedChildId(e.target.value)}
                                placeholder="-- Seleccione --"
                            />

                            <div className="flex justify-between pt-4 gap-2">
                                {user?.role === "ADMIN" && (
                                    <ITButton 
                                        label="Eliminar" 
                                        variant="outlined" 
                                        color="danger"
                                        disabled={selectedEvent?.data.appointments.length > 0}
                                        onClick={handleDelete} 
                                    />
                                )}
                                <div className="flex gap-2">
                                    <ITButton 
                                        label="Cancelar" 
                                        variant="outlined" 
                                        color="secondary" 
                                        onClick={() => setShowAssignModal(false)} 
                                    />
                                    <ITButton 
                                        label="Inscribir" 
                                        color="primary" 
                                        onClick={handleAssign}
                                        disabled={!selectedChildId}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                    {/* IF COACH, JUST SHOW CLOSE BUTTON OR SIMILAR */}
                    {user?.role === "COACH" && (
                         <div className="flex justify-end pt-4 gap-2">
                            <ITButton 
                                label="Cerrar" 
                                variant="outlined" 
                                color="secondary" 
                                onClick={() => setShowAssignModal(false)} 
                            />
                        </div>
                    )}
                </div>
            </ITDialog>

            {/* CREATE SCHEDULE DIALOG */}
            <ITDialog
                isOpen={showCreateModal}
                title="Crear Nuevo Horario"
                onClose={() => setShowCreateModal(false)}
                className="w-full max-w-md"
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                         <p className="text-sm font-semibold text-blue-800">Horario Seleccionado:</p>
                         <p className="text-gray-700">
                            Fecha: {createData.start ? format(createData.start, 'dd/MM/yyyy') : '-'}
                        </p>
                        <p className="text-gray-700">
                            Hora: {createData.start ? format(createData.start, 'HH:mm') : '-'} - {createData.end ? format(createData.end, 'HH:mm') : '-'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
                        <input
                            type="number"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                            value={createData.capacity}
                            onChange={(e) => setCreateData({...createData, capacity: Number(e.target.value)})}
                            min={1}
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Modo</label>
                         <input
                            type="text"
                            disabled
                            className="w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 shadow-sm sm:text-sm border p-2"
                            value={trainingModes.find(m => String(m.id) === selectedModeId)?.name || "Seleccionado"}
                        />
                    </div>

                    {/* COACH SELECTION FOR ADMIN */}
                    {user?.role === "ADMIN" && (
                         <ITSelect
                            label="Asignar Entrenador"
                            name="coachId"
                            options={coaches.map(c => ({ label: `${c.name} ${c.lastName}`, value: String(c.id) }))}
                            value={createData.coachId}
                            onChange={(e) => setCreateData({...createData, coachId: e.target.value})}
                            placeholder="Seleccionar entrenador..."
                         />
                    )}

                    {/* RECURRENCE OPTIONS */}
                    <div className="pt-2 border-t border-gray-100 mt-2">
                        <div className="flex items-center gap-2 mb-3 pt-2">
                            <input 
                                type="checkbox" 
                                id="isRecurring"
                                checked={isRecurring}
                                onChange={(e) => setIsRecurring(e.target.checked)}
                                className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-gray-300"
                            />
                            <label htmlFor="isRecurring" className="text-sm font-bold text-gray-700 select-none cursor-pointer">
                                Repetir semanalmente
                            </label>
                        </div>
                        
                        {isRecurring && (
                            <div className="space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Días de la semana</label>
                                    <div className="flex gap-1 justify-between">
                                        {WEEK_DAYS.map(day => (
                                            <label key={day.value} className="flex flex-col items-center cursor-pointer group">
                                                <span className={`text-xs font-bold mb-1 transition-colors ${selectedDays.includes(day.value) ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                                    {day.label}
                                                </span>
                                                <input 
                                                    type="checkbox"
                                                    checked={selectedDays.includes(day.value)}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setSelectedDays(prev => 
                                                            checked ? [...prev, day.value] : prev.filter(d => d !== day.value)
                                                        );
                                                    }}
                                                    className="rounded-full text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-gray-300 cursor-pointer"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Hasta la fecha</label>
                                    <input 
                                        type="date" 
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                        value={recurringUntil ? format(recurringUntil, 'yyyy-MM-dd') : ''}
                                        min={createData.start ? format(createData.start, 'yyyy-MM-dd') : undefined}
                                        onChange={(e) => setRecurringUntil(e.target.value ? new Date(e.target.value) : null)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4 gap-2">
                        <ITButton 
                            label="Cancelar" 
                            variant="outlined" 
                            color="secondary" 
                            onClick={() => setShowCreateModal(false)} 
                        />
                        <ITButton 
                            label="Guardar Horario" 
                            color="primary" 
                            onClick={async () => {
                                // Inline implementation until imports are fixed
                                if (!createData.start || !createData.end || !selectedModeId) return;
                                // Enforce Coach selection for Admin
                                if (user?.role === "ADMIN" && !createData.coachId) {
                                    dispatch(showToast({ type: "warning", message: "Debe asignar un entrenador al horario." }));
                                    return;
                                }

                                if (isRecurring) {
                                    if (selectedDays.length === 0) {
                                        dispatch(showToast({ type: "warning", message: "Seleccione al menos un día para la recurrencia." }));
                                        return;
                                    }
                                    if (!recurringUntil) {
                                        dispatch(showToast({ type: "warning", message: "Seleccione una fecha de fin para la recurrencia." }));
                                        return;
                                    }
                                }

                                setLoading(true);
                                try {
                                     const payload: any = {
                                         date: createData.start,
                                         startTime: createData.start,
                                         endTime: createData.end,
                                         capacity: createData.capacity,
                                         modeId: Number(selectedModeId),
                                         coachId: createData.coachId ? Number(createData.coachId) : null
                                     };

                                     if (isRecurring && recurringUntil) {
                                         payload.recurrence = {
                                             days: selectedDays,
                                             until: recurringUntil
                                         };
                                     }

                                     await createDaySchedule(payload);
                                     
                                     dispatch(showToast({ type: "success", message: "Horarios creados exitosamente" }));
                                     setShowCreateModal(false);
                                     
                                     const schedulesRes = await getAllDaySchedules();
                                     if (schedulesRes.data) setDaySchedules(schedulesRes.data);

                                } catch(e: any) {
                                     dispatch(showToast({ type: "error", message: e?.message || "Error al crear" }));
                                } finally {
                                    setLoading(false);
                                }
                            }} 
                        />
                    </div>
                </div>
            </ITDialog>
        </div>
    );
};


export default CalendarPage;
