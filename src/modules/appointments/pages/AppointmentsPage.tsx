import { AppState } from "@app/core/store/store";
import { ITButton, ITDialog, ITLoader } from "axzy_ui_system";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaCalendarTimes, FaClock, FaRunning, FaTrash, FaUser } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Appointment, deleteAppointment, getAllAppointments, getAppointmentsByUser } from "../service/AppointmentService";

const AppointmentsPage = () => {
    const user = useSelector((state: AppState) => state.auth);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

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

    const formatTime = (timeString: string) => {
         const date = new Date(timeString);
         if (isNaN(date.getTime())) return timeString;
         return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    if (loading && appointments.length === 0) {
        return (
            <div className="flex h-full items-center justify-center p-10">
                <ITLoader />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50">
             <div className="px-6 py-4 bg-gray-50">
                <h1 className="text-2xl font-bold text-gray-800">Mis Citas</h1>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {appointments.map((appointment) => {
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
                                        Parent: {appointment.user.name}
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
                                            {appointment.child.name} {appointment.child.lastName}
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
                            </div>
                            
                            <div className="border-t border-gray-100 my-1"></div>

                            <button
                                onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setShowDeleteModal(true);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium text-sm"
                            >
                                <FaTrash />
                                <span>Cancelar Cita</span>
                            </button>
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

            <ITDialog
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedAppointment(null);
                }}
                title="Cancelar Cita"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-gray-600">
                        ¿Estás seguro que deseas cancelar la cita de <span className="font-semibold text-gray-900">{selectedAppointment?.child.name}</span> para el <span className="font-semibold text-gray-900">{selectedAppointment ? new Date(selectedAppointment.schedule.date).toLocaleDateString() : ''}</span>?
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
        </div>
    );
};

export default AppointmentsPage;
