import { SelectOption } from "../../atoms/Select/types";
import { FileItemStatus } from "../../molecules/FileItem/types";

/**
 * Datos de un archivo subido
 */
export interface UploadedFile {
  /**
   * ID único del archivo (depende de qué usemos en el back)
   */
  id: string | number;

  /**
   * Nombre del archivo
   */
  name: string;

  /**
   * Estado del archivo
   */
  status: FileItemStatus;

  /**
   * Progreso de subida (0-100)
   */
  progress?: number;

  file: File;
}

/**
 * Datos del formulario de creación de ticket
 */
export interface TicketFormData {
  /**
   * Asunto del ticket
   */
  subject: string;

  /**
   * ID del departamento seleccionado
   */
  departmentId: string | number;

  /**
   * Descripción del problema
   */
  description: string;

  /**
   * Lista de archivos subidos
   */
  files: UploadedFile[];
}

/**
 * Props del componente TicketCreationPanel
 */
export interface TicketCreationPanelProps {
  /**
   * Opciones de departamentos disponibles
   */
  departments: SelectOption[];

  /**
   * Callback cuando se envía el formulario
   */
  onSubmit?: (data: TicketFormData) => void;

  /**
   * Callback cuando se cancela
   */
  onCancel?: () => void;

  /**
   * Indica si el formulario está en estado de envío
   */
  loading?: boolean;

  /**
   * Valores iniciales del formulario (opcional)
   */
  initialValues?: Partial<TicketFormData>;

  /**
   * Clase CSS adicional
   */
  className?: string;
  uploadProgress?: number; 
}
