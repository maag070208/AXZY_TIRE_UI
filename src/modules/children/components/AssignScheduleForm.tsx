import { ITButton, ITSelect } from "axzy_ui_system";
import { Form, Formik } from "formik";
import { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import { getAllDaySchedules } from "../../daySchedules/services/DayScheduleService";
import { getAllTrainingModes } from "../../traningMode/services/TrainingModeService";

const validationSchema = Yup.object({
  trainingModeId: Yup.string().required("El modo de entrenamiento es requerido"),
  dayScheduleId: Yup.number().required("El horario es requerido"),
});

interface AssignScheduleFormProps {
  onSubmit: (values: { trainingModeId: string; dayScheduleId: number }) => void;
  isLoading?: boolean;
  unavailableScheduleIds?: number[];
  initialValues?: { trainingModeId: string; dayScheduleId: number };
  submitLabel?: string;
}

const AssignScheduleForm = ({ 
    onSubmit, 
    isLoading, 
    unavailableScheduleIds = [], 
    initialValues = { trainingModeId: "", dayScheduleId: 0 },
    submitLabel = "Asignar"
}: AssignScheduleFormProps) => {
  const [trainingModes, setTrainingModes] = useState<any[]>([]);
  const [daySchedules, setDaySchedules] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [modesRes, schedulesRes] = await Promise.all([
                getAllTrainingModes(),
                getAllDaySchedules(),
            ]);
            if (modesRes?.data) setTrainingModes(modesRes.data);
            if (schedulesRes?.data) setDaySchedules(schedulesRes.data);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoadingData(false);
        }
    };
    fetchData();
  }, []);

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={(values) => {
        onSubmit(values);
      }}
    >
      {({ handleBlur, values, errors, touched, isValid, setFieldValue }) => {
        
        const filteredSchedules = useMemo(() => {
            if (!values.trainingModeId) return [];
            return daySchedules
                .filter(s => String(s.modeId) === String(values.trainingModeId))
                .filter(s => !unavailableScheduleIds.includes(s.id)) // Filter out already assigned
                .map(s => {
                    const booked = s.appointments ? s.appointments.length : 0;
                    const available = s.capacity - booked;
                    // Debug
                    if (available <= 0) {
                        console.log(`Filtering schedule ${s.id}: Cap=${s.capacity}, Booked=${booked}, Avail=${available}`);
                    }
                    const dateStr = new Date(s.date).toLocaleDateString("en-CA"); // YYYY-MM-DD
                    const startStr = new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const endStr = new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    return {
                        ...s,
                        available, // Add available to object for filtering
                        displayLabel: `${dateStr} Inicio: ${startStr} - Fin ${endStr} (Disponibles: ${available})`
                    };
                })
                .filter(s => s.available > 0 || s.id === initialValues.dayScheduleId); // Ensure current is visible if passed
        }, [daySchedules, values.trainingModeId, unavailableScheduleIds, initialValues.dayScheduleId]);


        return (
          <Form className="flex flex-col gap-4">
             {loadingData ? (
                 <p>Cargando datos...</p>
             ) : (
                 <>
                    <ITSelect
                        name="trainingModeId"
                        label="Modo de Entrenamiento"
                        options={trainingModes}
                        value={values.trainingModeId}
                        onChange={(e) => {
                             setFieldValue("trainingModeId", e.target.value);
                             setFieldValue("dayScheduleId", 0); 
                        }}
                        onBlur={handleBlur}
                        error={errors.trainingModeId}
                        touched={touched.trainingModeId}
                        labelField="name"
                        valueField="id"
                        required
                    />

                    <ITSelect
                        name="dayScheduleId"
                        label="Horario Disponible"
                        options={filteredSchedules}
                        value={String(values.dayScheduleId)}
                        onChange={(e) => setFieldValue("dayScheduleId", Number(e.target.value))}
                        onBlur={handleBlur}
                        error={errors.dayScheduleId}
                        touched={errors.dayScheduleId ? true : false}
                        labelField="displayLabel"
                        valueField="id"
                        required
                        disabled={!values.trainingModeId}
                    />
                    
                    <div className="flex justify-end mt-4">
                        <ITButton
                        type="submit"
                        disabled={!isValid || isLoading}
                        label={submitLabel}
                        />
                    </div>
                 </>
             )}
          </Form>
        );
      }}
    </Formik>
  );
};

export default AssignScheduleForm;
