import { Column, ITButton, ITTable } from "axzy_ui_system";
import { FaCalendarPlus, FaPencilAlt, FaTrash, FaChartLine } from "react-icons/fa";

interface ChildrenTableProps {
  data: any[];
  onRowClick: (rowData: any) => void;
  onRowDelete: (rowData: any) => void;
  onAssignTraining: (rowData: any) => void;
  onViewReports: (rowData: any) => void;
}

const ChildrenTable = ({ data, onRowClick, onRowDelete, onAssignTraining, onViewReports }: ChildrenTableProps) => {
  const actions = (row: any) => {
    // console.log("Rendering actions for child:", row.name);
    const hasAppointment = row.appointments && row.appointments.length > 0;

    return (
      <div className="flex flex-row gap-2 justify-center items-center">
        {hasAppointment && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mr-1">
                Asignado
            </span>
        )}
        <ITButton
          color="secondary"
          variant="outlined"
          onClick={() => onAssignTraining(row)}
          className="min-w-0 p-2"
          title={hasAppointment ? "Ya tiene entrenamiento asignado" : "Asignar Entrenamiento"}
          disabled={hasAppointment}
        >
          <FaCalendarPlus />
        </ITButton>
        <ITButton
          color="primary"
          variant="outlined"
          onClick={() => onRowClick(row)}
          className="min-w-0 p-2"
          title="Editar"
        >
          <FaPencilAlt />
        </ITButton>
        <ITButton
            color="success"
            variant="outlined"
            onClick={() => onViewReports(row)}
            className="min-w-0 p-2"
            title="Ver Reportes"
        >
            <FaChartLine />
        </ITButton>
        <ITButton
          color="danger"
          variant="outlined"
          onClick={() => onRowDelete(row)}
          className="min-w-0 p-2"
          title="Eliminar"
          disabled={hasAppointment} // Prevent deleting child with active appointment
        >
          <FaTrash />
        </ITButton>
      </div>
    );
  };

  const columns: Column[] = [
    {
      key: "name",
      label: "Nombre",
      type: "string",
    },
    {
      key: "lastName",
      label: "Apellido",
      type: "string",
    },
    {
      key: "birthDate",
      label: "Fecha de Nacimiento",
      type: "string",
      render: (row: any) => new Date(row.birthDate).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Acciones",
      type: "actions",
      className: "w-[240px]",
      actions: (row: any) => actions(row),
    },
  ];

  return <ITTable columns={columns} data={data} />;
};

export default ChildrenTable;
