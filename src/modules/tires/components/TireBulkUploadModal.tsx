import { ITButton, ITLoader } from "@axzydev/axzy_ui_system";
import { useState } from "react";
import * as XLSX from "xlsx";

interface TireBulkUploadModalProps {
  onUpload: (data: any[]) => void;
  isLoading?: boolean;
}

export const TireBulkUploadModal = ({ onUpload, isLoading }: TireBulkUploadModalProps) => {
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);

    const validExtensions = ["xlsx", "xls", "csv"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      setFileError("Formato de archivo inválido. Por favor sube un archivo Excel (.xlsx, .xls) o CSV.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        const workbook = XLSX.read(result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Parse the excel data to JSON
        const rawData = XLSX.utils.sheet_to_json(sheet) as any[];

        if (rawData.length === 0) {
            setFileError("El archivo parece estar vacío.");
            return;
        }

        // Validate and format data based on the required template
        const formattedData = rawData.map((row, index) => {
            const rowNum = index + 2; // +1 for 0-index, +1 for header
            
            if (!row.Marca || !row.Modelo || !row.Medida || !row.Tipo) {
                throw new Error(`Fila ${rowNum}: Faltan campos obligatorios (Marca, Modelo, Medida o Tipo).`);
            }

            const tipo = row.Tipo.toString().toUpperCase();
            if (!["NUEVA", "SEMINUEVA", "GALLITO"].includes(tipo)) {
                throw new Error(`Fila ${rowNum}: El Tipo "${tipo}" es inválido. Debe ser NUEVA, SEMINUEVA o GALLITO.`);
            }

            return {
                brand: row.Marca.toString().trim(),
                model: row.Modelo.toString().trim(),
                size: row.Medida.toString().trim(),
                type: tipo,
                cost: row.Costo ? Number(row.Costo) : 0,
                price: row.Precio ? Number(row.Precio) : 0,
                currentStock: row.Stock ? Number(row.Stock) : 0,
                minStock: row.StockMinimo ? Number(row.StockMinimo) : 0,
                sku: row.SKU ? row.SKU.toString().trim() : null,
                locationName: row.Ubicacion ? row.Ubicacion.toString().trim() : null,
            };
        });

        onUpload(formattedData);
      } catch (error: any) {
        setFileError(error.message || "Error al procesar el archivo Excel.");
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-blue-50 text-blue-800 p-4 rounded-md border border-blue-200">
        <h4 className="font-semibold mb-2">Instrucciones:</h4>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Sube un archivo en formato <b>.xlsx</b>, <b>.xls</b> o <b>.csv</b></li>
          <li>Asegúrate de incluir las siguientes columnas con los nombres exactos:</li>
          <li><b>Obligatorias:</b> <code className="bg-white px-1 py-0.5 rounded text-blue-900 border">Marca</code>, <code className="bg-white px-1 py-0.5 rounded text-blue-900 border">Modelo</code>, <code className="bg-white px-1 py-0.5 rounded text-blue-900 border">Medida</code>, <code className="bg-white px-1 py-0.5 rounded text-blue-900 border">Tipo</code></li>
          <li><b>Numéricas:</b> <code className="bg-white px-1 py-0.5 rounded text-blue-900 border">Costo</code>, <code className="bg-white px-1 py-0.5 rounded text-blue-900 border">Precio</code>, <code className="bg-white px-1 py-0.5 rounded text-blue-900 border">Stock</code>, <code className="bg-white px-1 py-0.5 rounded text-blue-900 border">StockMinimo</code></li>
          <li><b>Opcionales:</b> <code className="bg-white px-1 py-0.5 rounded text-blue-900 border">SKU</code>, <code className="bg-white px-1 py-0.5 rounded text-blue-900 border">Ubicacion</code> (Ej: "Pasillo A - Nivel 1")</li>
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold text-gray-700">Seleccionar Archivo</label>
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center">
            {isLoading ? (
                <div className="flex flex-col items-center gap-3">
                    <ITLoader size="md" />
                    <span className="text-gray-500 font-medium">Procesando y registrando llantas...</span>
                </div>
            ) : (
                <>
                    <input 
                        type="file" 
                        accept=".xlsx, .xls, .csv" 
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isLoading}
                    />
                    <div className="text-center pointer-events-none">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-1 text-sm text-gray-600">
                            Arrastra y suelta o <span className="text-blue-600 font-medium">haz click para examinar</span>
                        </p>
                    </div>
                </>
            )}
        </div>
        {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}
      </div>
    </div>
  );
};
