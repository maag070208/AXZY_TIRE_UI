import { AppState } from "@app/core/store/store";
import { showToast } from "@app/core/store/toast/toast.slice";
import { ITButton, ITInput, ITLoader } from "axzy_ui_system";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { getChildById } from "../../children/service/ChildrenService";
import { createEvaluation, getTechnicalAreas, ProgressIndicator, SwingLevel, TechnicalArea, TechnicalLevel } from "../services/EvaluationsService";

const EvaluationFormPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const childId = query.get("childId");

    const user = useSelector((state: AppState) => state.auth);
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const [areas, setAreas] = useState<TechnicalArea[]>([]);
    const [child, setChild] = useState<any>(null);

    // Form State
    const [swingMetrics, setSwingMetrics] = useState<{ [key in SwingLevel]: string }>({
        [SwingLevel.BASE]: "",
        [SwingLevel.OPTIMO]: "",
        [SwingLevel.ELITE]: ""
    });

    const [technicalRatings, setTechnicalRatings] = useState<{ [areaId: number]: { level: TechnicalLevel, indicator: ProgressIndicator } }>({});
    
    const [notes, setNotes] = useState("");
    const [devComments, setDevComments] = useState("");
    const [devIndicator, setDevIndicator] = useState<ProgressIndicator>(ProgressIndicator.ESTABLE);

    useEffect(() => {
        const init = async () => {
             setLoading(true);
             try {
                const areasRes = await getTechnicalAreas();
                if (areasRes.data) {
                    setAreas(areasRes.data);
                    // Init ratings
                    const initialRatings: any = {};
                    areasRes.data.forEach(a => {
                        initialRatings[a.id] = { level: TechnicalLevel.MEDIO, indicator: ProgressIndicator.ESTABLE };
                    });
                    setTechnicalRatings(initialRatings);
                }

                if (childId) {
                    const childRes = await getChildById(Number(childId));
                    if (childRes.data) setChild(childRes.data);
                }

             } catch (e) {
                 console.error(e);
             } finally {
                 setLoading(false);
             }
        };
        init();
    }, [childId]);

    const handleSubmit = async () => {
        if (!childId || !user?.id) return;

        setLoading(true);
        try {
            // Prepare Swing Metrics
            const metricsPayload = Object.entries(swingMetrics)
                .filter(([_, speed]) => speed !== "")
                .map(([level, speed]) => ({
                    level: level as SwingLevel,
                    speedMph: Number(speed)
                }));

            // Prepare Technical Ratings
            const ratingsPayload = Object.entries(technicalRatings).map(([areaId, rating]) => ({
                areaId: Number(areaId),
                level: rating.level,
                indicator: rating.indicator
            }));

            await createEvaluation({
                childId: Number(childId),
                coachId: Number(user.id),
                age: child?.age, // TODO: Calculate age accurately if needed
                category: "Juvenil", // Default or derived
                notes: notes,
                swingMetrics: metricsPayload,
                technicalRatings: ratingsPayload,
                developmentLog: {
                    comments: devComments,
                    indicator: devIndicator
                }
            });

            dispatch(showToast({ type: "success", message: "Evaluación guardada correctamente" }));
            navigate(-1); // Go back to calendar

        } catch (e: any) {
            console.error(e);
            dispatch(showToast({ type: "error", message: e?.message || "Error al guardar" }));
        } finally {
            setLoading(false);
        }
    };

    if (loading && !child) return <div className="flex justify-center py-20"><ITLoader /></div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-24">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 rounded-full text-slate-600">
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Nueva Evaluación</h1>
                        <p className="text-slate-500">
                            Evaluando a <span className="font-semibold text-blue-600">{child?.name} {child?.lastName}</span>
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* SWING METRICS */}
                    <div className="bg-white p-6 rounded-xl shadow border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Velocidad de Swing (MPH)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(Object.values(SwingLevel) as SwingLevel[]).map((level) => (
                                <div key={level}>
                                    <ITInput
                                        label={`Nivel ${level}`}
                                        name={`swing_${level}`}
                                        type="number"
                                        value={swingMetrics[level]}
                                        onChange={(e) => setSwingMetrics({ ...swingMetrics, [level]: e.target.value })}
                                        onBlur={() => {}}
                                        placeholder="0.0"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TECHNICAL RATINGS */}
                    <div className="bg-white p-6 rounded-xl shadow border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Evaluación Técnica</h2>
                        <div className="space-y-4">
                            {areas.map((area) => (
                                <div key={area.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-50 p-3 rounded-lg">
                                    <div className="font-medium text-slate-700">{area.name}</div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Nivel</label>
                                        <select
                                            className="w-full rounded border-gray-300 text-sm p-2"
                                            value={technicalRatings[area.id]?.level || TechnicalLevel.MEDIO}
                                            onChange={(e) => setTechnicalRatings({
                                                ...technicalRatings,
                                                [area.id]: { ...technicalRatings[area.id], level: e.target.value as TechnicalLevel }
                                            })}
                                        >
                                            {Object.values(TechnicalLevel).map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1 block">Progreso</label>
                                        <select
                                            className="w-full rounded border-gray-300 text-sm p-2"
                                            value={technicalRatings[area.id]?.indicator || ProgressIndicator.ESTABLE}
                                            onChange={(e) => setTechnicalRatings({
                                                ...technicalRatings,
                                                [area.id]: { ...technicalRatings[area.id], indicator: e.target.value as ProgressIndicator }
                                            })}
                                        >
                                            {Object.values(ProgressIndicator).map(i => <option key={i} value={i}>{i}</option>)}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* DEVELOPMENT LOG */}
                    <div className="bg-white p-6 rounded-xl shadow border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Historial de Desarrollo</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado General</label>
                                <select
                                    className="w-full rounded border-gray-300 p-2"
                                    value={devIndicator}
                                    onChange={(e) => setDevIndicator(e.target.value as ProgressIndicator)}
                                >
                                    {Object.values(ProgressIndicator).map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones / Comentarios</label>
                                <textarea
                                    className="w-full rounded border-gray-300 p-2 h-24"
                                    value={devComments}
                                    onChange={(e) => setDevComments(e.target.value)}
                                    placeholder="Comentarios sobre el progreso..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notas Adicionales (Opcional)</label>
                                <textarea
                                    className="w-full rounded border-gray-300 p-2 h-16"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Notas generales..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-4 pt-4">
                        <ITButton label="Cancelar" variant="outlined" color="secondary" onClick={() => navigate(-1)} />
                        <ITButton label="Guardar Evaluación" color="primary" onClick={handleSubmit} disabled={loading} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvaluationFormPage;
