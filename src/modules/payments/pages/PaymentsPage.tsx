import { useEffect, useState } from "react";
import { ITSelect, ITLoader } from "axzy_ui_system";
import { getCoaches, User as CoachUser } from "../../users/services/UserService";
import { getCoachPayments, PaymentSummary } from "../services/PaymentsService";
import { format, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { FaMoneyBillWave, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const PaymentsPage = () => {
    const [coaches, setCoaches] = useState<CoachUser[]>([]);
    const [selectedCoachId, setSelectedCoachId] = useState<string>("");
    
    // Week State (Reference date)
    const [currentDate, setCurrentDate] = useState(new Date());

    const [payments, setPayments] = useState<PaymentSummary[]>([]);
    const [loading, setLoading] = useState(false);

    // Initial Fetch (Coaches)
    useEffect(() => {
        getCoaches().then(res => {
            if (res.data) setCoaches(res.data);
        });
    }, []);

    // Derived Dates
    // Monday
    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
    // Sunday
    const endOfCurrentWeek = endOfWeek(currentDate, { weekStartsOn: 1 });

    // Fetch Payments
    useEffect(() => {
        const fetchPayments = async () => {
             setLoading(true);
             try {
                 const startStr = startOfCurrentWeek.toISOString();
                 const endStr = endOfCurrentWeek.toISOString();

                 const res = await getCoachPayments(startStr, endStr, selectedCoachId ? Number(selectedCoachId) : undefined);
                 if (res.data) setPayments(res.data);
             } catch (e) {
                 console.error(e);
             } finally {
                 setLoading(false);
             }
        };
        fetchPayments();
    }, [selectedCoachId, currentDate]);

    const handlePrevWeek = () => setCurrentDate(prev => subWeeks(prev, 1));
    const handleNextWeek = () => setCurrentDate(prev => addWeeks(prev, 1));

    return (
        <div className="p-6 bg-slate-50 min-h-full">
             <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-green-600 p-3 rounded-lg shadow-green-200 shadow-lg">
                        <FaMoneyBillWave className="text-white text-xl" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-slate-800">Pagos a Entrenadores</h1>
                        <p className="text-sm md:text-base text-slate-500">Gestión de nómina semanal</p>
                    </div>
                </div>
            </div>

            {/* FILTERS & NAVIGATION */}
            <div className="bg-white p-4 rounded-xl shadow border border-slate-200 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                 <div className="w-full md:w-64">
                     <ITSelect
                        label="Entrenador"
                        name="coach"
                        value={selectedCoachId}
                        onChange={(e) => setSelectedCoachId(e.target.value)}
                        options={[
                            ...coaches.map(c => ({ label: `${c.name} ${c.lastName}`, value: String(c.id) }))
                        ]}
                     />
                 </div>
                 
                 {/* Week Navigation */}
                 <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <button 
                        onClick={handlePrevWeek}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
                    >
                        <FaChevronLeft />
                    </button>
                    
                    <div className="text-center min-w-[200px]">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Semana</p>
                        <p className="font-bold text-slate-700">
                            {format(startOfCurrentWeek, "dd MMM")} - {format(endOfCurrentWeek, "dd MMM yyyy")}
                        </p>
                    </div>

                    <button 
                        onClick={handleNextWeek}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
                    >
                        <FaChevronRight />
                    </button>
                 </div>
            </div>

            {/* CONTENT */}
            {loading ? (
                <div className="flex justify-center py-10"><ITLoader /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {payments.length === 0 ? (
                        <div className="col-span-full text-center py-10 text-gray-400">
                            No se encontraron registros de pagos para esta semana.
                        </div>
                    ) : (
                        payments.map((summary) => (
                            <div key={summary.coachId} className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-4">
                                     <h3 className="text-white font-bold text-lg">{summary.coachName}</h3>
                                     <div className="flex justify-between text-gray-300 text-sm mt-1">
                                         <span>ID: {summary.coachId}</span>
                                     </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-4 border-b pb-4">
                                        <div className="text-center w-1/2 border-r">
                                            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Clases</p>
                                            <p className="text-2xl font-bold text-slate-800">{summary.completedClasses}</p>
                                        </div>
                                        <div className="text-center w-1/2">
                                            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Total a Pagar</p>
                                            <p className="text-2xl font-bold text-green-600">${summary.totalAmount}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="max-h-48 overflow-y-auto">
                                        <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Detalles</p>
                                        <div className="space-y-2">
                                            {summary.details.map((detail, idx) => (
                                                <div key={idx} className="flex justify-between text-sm bg-slate-50 p-2 rounded">
                                                    <div>
                                                        <p className="font-medium text-slate-700">{detail.mode}</p>
                                                        <p className="text-xs text-gray-400">{format(parseISO(detail.date), "dd/MM/yyyy HH:mm")}</p>
                                                    </div>
                                                    <div className="font-semibold text-slate-600">
                                                        ${detail.cost}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default PaymentsPage;
