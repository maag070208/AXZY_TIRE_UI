import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ITLoader, ITButton } from "axzy_ui_system";
import { get } from "@app/core/axios/axios";
import { FaFilePdf } from "react-icons/fa";

interface EvaluationsListProps {
    childId: number;
}

const EvaluationsList = ({ childId }: EvaluationsListProps) => {
    const [evaluations, setEvaluations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEvaluations = async () => {
             setLoading(true);
             try {
                 const res = await get<any[]>(`/evaluations/child/${childId}`);
                 if (res.data) {
                     setEvaluations(res.data);
                 }
             } catch (e) {
                 console.error(e);
             } finally {
                 setLoading(false);
             }
        };
        fetchEvaluations();
    }, [childId]);

    const downloadPdf = async (id: number) => {
        try {
            // We use our axios instance which has the interceptor
            const blobData = await get(`/evaluations/${id}/pdf`, { responseType: 'blob' });
            
            // Create blob link to download
            // blobData is already the Blob because 'get' returns response.data
            const url = window.URL.createObjectURL(new Blob([blobData as any]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_evaluacion_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            console.error("Download failed", e);
            alert("Error al descargar PDF");
        }
    };

    if (loading) return <div className="flex justify-center p-4"><ITLoader /></div>;

    if (evaluations.length === 0) return <div className="text-gray-500 text-center p-4">No hay evaluaciones registradas.</div>;

    return (
        <div className="space-y-3">
            {evaluations.map((ev) => (
                <div key={ev.id} className="border p-3 rounded-lg flex justify-between items-center bg-white shadow-sm">
                    <div>
                        <p className="font-semibold text-gray-800">Evaluación {format(new Date(ev.createdAt), 'dd MMMM yyyy')}</p>
                        <p className="text-sm text-gray-500">Entrenador: {ev.coach.name} {ev.coach.lastName}</p>
                    </div>
                    <ITButton 
                        variant="outlined"
                        color="primary"
                        onClick={() => downloadPdf(ev.id)}
                    >
                        <div className="flex items-center gap-2">
                            <FaFilePdf />
                            <span>PDF</span>
                        </div>
                    </ITButton>
                </div>
            ))}
        </div>
    );
};

export default EvaluationsList;
