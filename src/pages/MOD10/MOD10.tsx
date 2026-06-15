"use client";

import React, { useState } from "react";
import { FormField } from "../../components/client/molecules/FormField";
import { Input } from "../../components/client/atoms/Input";
import { TextArea } from "../../components/client/atoms/TextArea";
import { Select } from "../../components/client/atoms/Select";
import { FileDropzone } from "../../components/client/molecules/FileDropzone";
import { FileItem } from "../../components/client/molecules/FileItem";
import { FormActions } from "../../components/client/molecules/FormActions";
import { Button } from "../../components/client/atoms/Button";
import MOD10Modal from "../../components/client/organisms/MOD10Modal";

import styles from "./MOD10.module.scss";
import type { casesNotificationFormData, UploadedFile } from "./types";
import { useSendEmailNotification } from "@/api/hooks";

const destinyAreas = [
    { label: "PMT", value: "PMT" },
    { label: "Semaforización", value: "SEMAFORIZACION" },
    { label: "Jurídico", value: "JURIDICO" },
];

export const MOD10: React.FC = () => {
    // Mutations
    const { sendNotification } = useSendEmailNotification();

    // Estados del formulario
    const [destinyArea, setDestinyArea] = useState<string>('');
    const [documentDate, setDocumentDate] = useState<string>('');
    const [issuedBy, setIssuedBy] = useState<string>('');
    const [caseNumber, setCaseNumber] = useState<string>('');
    const [pageNumbers, setPageNumbers] = useState<number | undefined>(0);
    const [name, setName] = useState<string>('');
    const [reference, setReference] = useState<string>('');
    const [uploadedFile, setUploadedFile] = useState<UploadedFile>();
    const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);
    
    // Estados del modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingFormData, setPendingFormData] = useState<casesNotificationFormData | null>(null);
    
    const ALLOWED_EXTENSIONS = ['pdf'];

    const handleFile = (files: File[]) => {
        if (files.length === 0) return;

        const file = files[0];
        setRejectedFiles([]);

        // El archivo debe ser PDF 
        if (!ALLOWED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(`.${ext}`))) {
            setRejectedFiles(prev => [...prev, file.name]);
            return;
        }

        const newFile: UploadedFile = {
            id: Date.now(),
            name: file.name,
            status: "uploading",
            progress: 0,
            file,
        };

        setUploadedFile(newFile);

        // Simular progreso de carga
        const interval = setInterval(() => {
            setUploadedFile(prev => {
                if (!prev) return prev;
                const newProgress = prev.progress ? prev.progress + 20 : 20;
                if (newProgress >= 100) {
                    clearInterval(interval);
                    return { ...prev, progress: 100, status: "ready" };
                }
                return { ...prev, progress: newProgress };
            });
        }, 500);
    };
    // Eliminar archivo
    const handleRemoveFile = () => {
        setUploadedFile(undefined);
    };

    // Manejar envío del formulario
    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!uploadedFile) {
            alert("Por favor, sube un archivo PDF antes de enviar el formulario.");
            return;
        }

        if (destinyArea==='' || documentDate==='' || issuedBy==='' || caseNumber==='' || pageNumbers===undefined || name==='' || reference==='') {
            alert("Por favor, completa todos los campos obligatorios antes de enviar el formulario.");
            return;
        }

        const formData: casesNotificationFormData = {
            destinyArea,
            documentDate,
            issuedBy,
            caseNumber,
            pageNumbers,
            name,
            reference,
            file: uploadedFile,
        };

        // Abrir el modal con los datos
        setPendingFormData(formData);
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (data: casesNotificationFormData) => {
        try {
            const result = await sendNotification(
                {
                    areaDestino: data.destinyArea,
                    fechaDocumento: data.documentDate,
                    emitidoPor: data.issuedBy,
                    numeroExpediente: data.caseNumber,
                    numeroFolio: data.pageNumbers,
                    nombre: data.name,
                    referencia: data.reference,
                },
                data.file.file
            );
            console.log("Success:", result);
            setIsModalOpen(false);
            setPendingFormData(null);
        } catch (err) {
            console.error("Error sending notification:", err);
        }
    };

    return (
        <div className={styles.mainContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.fieldsRow}>
                    <div className={styles.fieldsColumn}>
                        {/* Área destino */}
                        <FormField label="Área destino" htmlFor="destinyArea" required className={styles.fieldDestinyArea}>
                            <Select
                                id="destinyArea"
                                value={destinyArea}
                                onChange={(e) => setDestinyArea(e.target.value)}
                                options={destinyAreas}
                                placeholder="Selecciona un área"
                                // state={loading ? "disabled" : "default"}
                                required
                            />
                        </FormField>

                        {/* Fecha del documento */}
                        <FormField label="Fecha del documento" htmlFor="documentDate" required className={styles.fieldDocumentDate}>
                            <Input
                                id="documentDate"
                                type="date"
                                value={documentDate}
                                onChange={(e) => setDocumentDate(e.target.value)}
                                placeholder="Ingresa la fecha del documento"
                                // state={loading ? "disabled" : "default"}
                                required
                            />
                        </FormField>

                        {/* Emitido por */}
                        <FormField label="Emitido por" htmlFor="issuedBy" required className={styles.fieldIssuedBy}>
                            <Input
                                id="issuedBy"
                                type="text"
                                value={issuedBy}
                                onChange={(e) => setIssuedBy(e.target.value)}
                                placeholder="Ingresa el nombre de quien emite el documento"
                                // state={loading ? "disabled" : "default"}
                                required
                            />
                        </FormField>

                        {/* Número de expediente */}
                        <FormField label="Número de expediente" htmlFor="caseNumber" required className={styles.fieldCaseNumber}>
                            <Input
                                id="caseNumber"
                                type="text"
                                value={caseNumber}
                                onChange={(e) => setCaseNumber(e.target.value)}
                                placeholder="Ingresa el número de expediente"
                                // state={loading ? "disabled" : "default"}
                                required
                            />
                        </FormField>

                        {/* Número de folios */}
                        <FormField label="Número de folios" htmlFor="pageNumbers" required className={styles.fieldPageNumbers}>
                            <Input
                                id="pageNumbers"
                                type="number"
                                value={pageNumbers}
                                onChange={(e) => setPageNumbers(+e.target.value)}
                                placeholder="Ingresa el número de folios"
                                // state={loading ? "disabled" : "default"}
                                required
                            />
                        </FormField>

                        {/* Nombre */}
                        <FormField label="Nombre" htmlFor="name" required className={styles.fieldName}>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ingresa el nombre del caso o asunto"
                                // state={loading ? "disabled" : "default"}
                                required
                            />
                        </FormField>
                    </div>

                    {/* Referencia (text area) */}
                    <FormField label="Referencia" htmlFor="reference" className={styles.fieldReference}>
                        <TextArea
                            id="reference"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            placeholder="Ingresa una referencia o descripción adicional (opcional)"
                            rows={4}
                            required
                        />
                    </FormField>
                </div>

                {/* Archivos */}
                <div className={styles.filesSection}>
                    <FileDropzone onFiles={handleFile} rejectedFiles={rejectedFiles} />

                    {uploadedFile && (
                        <FileItem
                            key={uploadedFile.id}
                            name={uploadedFile.name}
                            status={uploadedFile.status}
                            progress={uploadedFile.progress}
                            onRemove={handleRemoveFile}
                        />
                    )}
                </div>

                {/* Botones de acción */}
                <FormActions align="center">
                    <Button
                        type="submit"
                        variant="contained"
                        color="default"
                        rounded
                        // state={loading ? "loading" : "default"}
                        loadingText="Enviando..."
                    >
                        Enviar
                    </Button>
                </FormActions>
            </form>

            {/* Modal de vista previa */}
            {pendingFormData && (
                <MOD10Modal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setPendingFormData(null);
                    }}
                    onSubmit={handleModalSubmit}
                    {...pendingFormData}
                />
            )}
        </div>
    );
};

export default MOD10;
