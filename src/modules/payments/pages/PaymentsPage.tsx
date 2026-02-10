import { getCoaches } from "../../users/services/UserService";
import { getCoachPayments, PaymentSummary } from "../services/PaymentsService";
import { format, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { 
    FaMoneyBillWave, 
    FaChevronLeft, 
    FaChevronRight, 
    FaUser, 
    FaDumbbell 
    } from "react-icons/fa";
import { useEffect, useState } from "react";
import { ITSelect, ITLoader } from "axzy_ui_system";

const PaymentsPage = () => {
    const [coaches, setCoaches] = useState<any[]>([]);
    const [selectedCoachId, setSelectedCoachId] = useState<string>("");
    
    // Week State (Reference date)
    const [currentDate, setCurrentDate] = useState(new Date());

    const [payments, setPayments] = useState<PaymentSummary[]>([]);
    const [loading, setLoading] = useState(false);

    // Initial Fetch (Coaches)
    useEffect(() => {
        getCoaches().then(res => {
            if (res?.data) setCoaches(res.data);
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
                 if (res?.data) setPayments(res.data);
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
        <div className="flex flex-col h-full bg-gray-50">
             <div className="px-6 py-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Pagos a Entrenadores</h1>
                </div>
                
                {/* FILTERS & NAVIGATION */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                     <div className="w-full md:w-64">
                         <ITSelect
                            label="Entrenador"
                            name="coach"
                            value={selectedCoachId}
                            onChange={(e) => setSelectedCoachId(e.target.value)}
                            options={[
                                { label: "Todos", value: "" },
                                ...coaches.map(c => ({ label: `${c.name} ${c.lastName}`, value: String(c.id) }))
                            ]}
                         />
                     </div>
                     
                     {/* Week Navigation */}
                     <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-200">
                        <button 
                            onClick={handlePrevWeek}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600"
                        >
                            <FaChevronLeft />
                        </button>
                        
                        <div className="text-center min-w-[200px]">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Semana</p>
                            <p className="font-bold text-gray-800 text-sm">
                                {format(startOfCurrentWeek, "dd MMM")} - {format(endOfCurrentWeek, "dd MMM yyyy")}
                            </p>
                        </div>

                        <button 
                            onClick={handleNextWeek}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600"
                        >
                            <FaChevronRight />
                        </button>
                     </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
                {loading ? (
                    <div className="flex justify-center py-20"><ITLoader /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {payments.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                                <FaMoneyBillWave className="text-6xl mb-4 opacity-20" />
                                <p>No se encontraron registros de pagos para esta semana.</p>
                            </div>
                        ) : (
                            payments.map((summary) => (
                                <div key={summary.coachId} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 relative overflow-hidden">
                                    <div className="flex items-center justify-between">
                                         <div className="flex items-center gap-3">
                                             <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                                                <FaUser className="text-xl" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 leading-tight">{summary.coachName}</h3>
                                                <span className="text-xs text-gray-400">ID: {summary.coachId}</span>
                                            </div>
                                         </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-3">
                                        <div className="text-center border-r border-gray-200">
                                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Clases</p>
                                            <p className="text-xl font-bold text-gray-800">{summary.completedClasses}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Total</p>
                                            <p className="text-xl font-bold text-green-600">${summary.totalAmount}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t border-gray-100 my-1"></div>

                                    <div className="flex-1 overflow-hidden flex flex-col">
                                        <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Detalles de Clases</p>
                                        <div className="space-y-3 overflow-y-auto max-h-48 pr-1">
                                            {summary.details.map((detail, idx) => (
                                                <div key={idx} className="flex justify-between items-start text-sm group">
                                                    <div className="flex gap-2">
                                                        <div className="pt-1 text-gray-300">
                                                            <FaDumbbell className="text-xs" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-700">{detail.mode}</p>
                                                            <div className="text-[11px] text-gray-400">
                                                                {/* Check if detail.date is string or Date */}
                                                                {detail.date ? format(typeof detail.date === 'string' ? parseISO(detail.date) : detail.date, "dd/MM HH:mm") : '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="font-semibold text-gray-600 pt-1">
                                                        ${detail.cost}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default PaymentsPage;
