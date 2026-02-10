import { AppState } from "@app/core/store/store";
import { ITButton, ITDialog, ITLoader } from "axzy_ui_system";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaCalendarTimes, FaClock, FaFilter, FaPencilAlt, FaRunning, FaTimes, FaTrash, FaUser, FaUserTie } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Appointment, deleteAppointment, getAllAppointments, getAppointmentsByUser, updateAppointment } from "../service/AppointmentService";
import AssignScheduleForm from "../../children/components/AssignScheduleForm";

const AppointmentsPage = () => {
    const user = useSelector((state: AppState) => state.auth);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    // Filter States
    const [filterName, setFilterName] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filterTime, setFilterTime] = useState("");
    const [filterCoach, setFilterCoach] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const hasFilters = filterName || filterDate || filterTime || filterCoach;

    const clearFilters = () => {
        setFilterName("");
        setFilterDate("");
        setFilterTime("");
        setFilterCoach("");
    };

    const formatTime = (timeString: string) => {
         const date = new Date(timeString);
         if (isNaN(date.getTime())) return timeString;
         return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const filteredAppointments = appointments.filter(appt => {
        const attendeeName = appt.child 
            ? `${appt.child.name} ${appt.child.lastName}` 
            : `${appt.user?.name || ''} ${appt.user?.lastName || ''}`; 

        const childName = attendeeName.toLowerCase();
        const coachName = appt.schedule.coach ? `${appt.schedule.coach.name} ${appt.schedule.coach.lastName}`.toLowerCase() : "";
        const apptDate = new Date(appt.schedule.date).toLocaleDateString('en-CA'); // YYYY-MM-DD
        const apptTime = formatTime(appt.schedule.startTime);

        const matchesName = childName.includes(filterName.toLowerCase());
        const matchesDate = !filterDate || apptDate === filterDate;
        const matchesTime = !filterTime || apptTime.includes(filterTime);
        const matchesCoach = !filterCoach || coachName.includes(filterCoach.toLowerCase());

        return matchesName && matchesDate && matchesTime && matchesCoach;
    });

    const fetchAppointments = async () => {
        if (!user.id) return;
        setLoading(true);
        try {
            let res;
            if (user.role === "ADMIN") {
                res = await getAllAppointments();
            } else {
                res = await getAppointmentsByUser(user.id);
            }

            if (res?.data) {
                setAppointments(res.data);
            }
        } catch (error) {
            console.error("Error fetching appointments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [user.id, user.role]);

    const handleDelete = async () => {
        if (!selectedAppointment) return;
        try {
            await deleteAppointment(selectedAppointment.id);
            setShowDeleteModal(false);
            setSelectedAppointment(null);
            fetchAppointments();
        } catch (error) {
            console.error("Error deleting appointment", error);
        }
    };

    const handleUpdate = async (values: { trainingModeId: string; dayScheduleId: number }) => {
        if (!selectedAppointment) return;
        try {
             await updateAppointment(selectedAppointment.id, {
                 modeId: Number(values.trainingModeId),
                 scheduleId: Number(values.dayScheduleId)
             });
             setShowEditModal(false);
             setSelectedAppointment(null);
             fetchAppointments();
        } catch (error) {
            console.error("Error updating appointment", error);
            // Optionally show error toast here
        }
    };


    if (loading && appointments.length === 0) {
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
                    <h1 className="text-2xl font-bold text-gray-800">Mis Citas</h1>
                    <button 
                        className="md:hidden flex items-center gap-2 text-indigo-600 font-medium text-sm bg-indigo-50 px-3 py-1.5 rounded-lg"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FaFilter /> {showFilters ? 'Ocultar' : 'Filtrar'}
                    </button>
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

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Name Filter */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaUser className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Buscar por alumno..."
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                            />
                        </div>

                        {/* Date Filter */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaCalendarAlt className="text-gray-400" />
                            </div>
                            <input
                                type="date"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>

                        {/* Time Filter */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaClock className="text-gray-400" />
                            </div>
                             <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Hora (ej: 09:00)"
                                value={filterTime}
                                onChange={(e) => setFilterTime(e.target.value)}
                            />
                        </div>

                        {/* Coach Filter */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaUserTie className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Buscar por entrenador..."
                                value={filterCoach}
                                onChange={(e) => setFilterCoach(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAppointments.map((appointment) => {
                     const date = new Date(appointment.schedule.date).toLocaleDateString();
                     const startTime = formatTime(appointment.schedule.startTime);
                     const endTime = formatTime(appointment.schedule.endTime);

                    return (
                        <div 
                            key={appointment.id} 
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between">
                                <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide flex items-center">
                                    <FaRunning className="mr-1" />
                                    {appointment.mode.name}
                                </span>
                                {user.role === "ADMIN" && appointment.user && (
                                     <span className="text-xs text-gray-400">
                                        Padre: {appointment.user.name}
                                     </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0">
                                        <FaUser />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-500 font-medium">Atleta</span>
                                        <span className="text-base font-bold text-gray-900">
                                            {appointment.child 
                                                ? `${appointment.child.name} ${appointment.child.lastName}` 
                                                : `${appointment.user?.name || ''} ${appointment.user?.lastName || ''}`}
                                        </span>
                                    </div>
                                </div>

                                 <div className="flex items-center gap-3 mt-2">
                                     <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                                        <FaCalendarAlt />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-500 font-medium">Fecha</span>
                                        <span className="text-base font-semibold text-gray-900">
                                            {date}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
                                        <FaClock />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-500 font-medium">Horario</span>
                                        <span className="text-base font-semibold text-gray-900">
                                            {startTime} - {endTime}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 flex-shrink-0">
                                        <FaUserTie />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-500 font-medium">Entrenador</span>
                                        <span className="text-base font-semibold text-gray-900">
                                            {appointment.schedule.coach ? `${appointment.schedule.coach.name} ${appointment.schedule.coach.lastName || ''}` : "Por asignar"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        setSelectedAppointment(appointment);
                                        setShowEditModal(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors font-medium text-sm"
                                >
                                    <FaPencilAlt />
                                    <span>Editar</span>
                                </button>
                                <div className="w-px h-8 bg-gray-100"></div>
                                <button
                                    onClick={() => {
                                        setSelectedAppointment(appointment);
                                        setShowDeleteModal(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium text-sm"
                                >
                                    <FaTrash />
                                    <span>Cancelar</span>
                                </button>
                            </div>
                        </div>
                    );
                })}

                {appointments.length === 0 && !loading && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                        <FaCalendarTimes className="text-6xl mb-4 opacity-20" />
                        <p>No tienes citas programadas.</p>
                    </div>
                )}
            </div></div>

            {/* DELETE CONFIRM MODAL */}
            <ITDialog
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedAppointment(null);
                }}
                title="Cancelar Cita"
            >
                <div className="flex flex-col gap-4">
                        <p className="text-gray-600 mb-6">
                            ¿Estás seguro de que deseas eliminar la cita para <strong>
                                {selectedAppointment?.child 
                                    ? `${selectedAppointment.child.name} ${selectedAppointment.child.lastName}`
                                    : `${selectedAppointment?.user?.name || ''} ${selectedAppointment?.user?.lastName || ''}`}
                            </strong>? esta acción no se puede deshacer.
                        </p>
                    <div className="flex justify-end gap-2 mt-4">
                        <ITButton
                            label="No, volver"
                            variant="outlined"
                            color="secondary"
                            onClick={() => setShowDeleteModal(false)}
                        />
                        <ITButton
                            label="Sí, cancelar"
                            color="danger"
                            onClick={handleDelete}
                        />
                    </div>
                </div>
            </ITDialog>

             {/* EDIT MODAL */}
             <ITDialog
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedAppointment(null);
                }}
                title="Reprogramar Cita"
            >
                {selectedAppointment && (
                    <AssignScheduleForm 
                        initialValues={{
                            trainingModeId: String(selectedAppointment.modeId),
                            dayScheduleId: selectedAppointment.scheduleId
                        }}
                        onSubmit={handleUpdate}
                        submitLabel="Actualizar Cita"
                        unavailableScheduleIds={
                            appointments
                                .filter(a => a.childId === selectedAppointment.childId && a.id !== selectedAppointment.id)
                                .map(a => a.scheduleId)
                        }
                    />
                )}
            </ITDialog>
        </div>
    );
};

export default AppointmentsPage;
