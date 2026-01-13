import { get, post } from "@app/core/axios/axios";
import { TResult } from "@app/core/types/TResult";

export interface TechnicalArea {
    id: number;
    name: string;
}

export enum SwingLevel {
    BASE = "BASE",
    OPTIMO = "OPTIMO",
    ELITE = "ELITE"
}

export enum TechnicalLevel {
    BAJO = "BAJO",
    MEDIO = "MEDIO",
    ALTO = "ALTO"
}

export enum ProgressIndicator {
    PROGRESO = "PROGRESO",
    ESTABLE = "ESTABLE",
    ATENCION = "ATENCION"
}

export interface CreateEvaluationDTO {
    childId: number;
    coachId: number;
    age?: number;
    category?: string;
    notes?: string;
    swingMetrics: { level: SwingLevel; speedMph: number }[];
    technicalRatings: { areaId: number; level: TechnicalLevel; indicator: ProgressIndicator }[];
    developmentLog: { comments: string; indicator: ProgressIndicator };
}

export const getTechnicalAreas = async (): Promise<TResult<TechnicalArea[]>> => {
    return await get<TechnicalArea[]>("/evaluations/areas");
};

export const createEvaluation = async (data: CreateEvaluationDTO): Promise<TResult<any>> => {
    return await post<any>("/evaluations", data);
};
