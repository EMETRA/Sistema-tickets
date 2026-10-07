import type { TipoUsoVehiculo } from '@/api/graphql/apps/types';

export interface UsoVehiculoOption {
    value: TipoUsoVehiculo;
    label: string;
}

/**
 * Etiquetas legibles para el enum TipoUsoVehiculo del backend (SAT muni-ws).
 * El backend solo expone los códigos crudos; esta es una traducción de
 * mejor esfuerzo que debe confirmarse con SAT/negocio y ajustarse si hace falta.
 */
export const USO_VEHICULO_OPTIONS: UsoVehiculoOption[] = [
    { value: 'P0', label: 'P0 - Particular' },
    { value: 'A0', label: 'A0 - Alquiler' },
    { value: 'C0', label: 'C0 - Comercial' },
    { value: 'O0', label: 'O0 - Oficial' },
    { value: 'M0', label: 'M0 - Motocicleta' },
    { value: 'U0', label: 'U0 - Genérico (U0)' },
    { value: 'MI', label: 'MI - Militar' },
    { value: 'CC', label: 'CC - Cuerpo Consular' },
    { value: 'CD', label: 'CD - Cuerpo Diplomático' },
    { value: 'TC', label: 'TC - Transporte Comercial' },
    { value: 'TE', label: 'TE - Transporte Extraurbano' },
    { value: '00', label: '00 - Genérico (00)' },
    { value: 'TRC', label: 'TRC - Transporte de Carga' },
];

export interface VehiculoInfoField {
    label: string;
    value?: string;
}
