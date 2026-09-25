"use client";

import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import { Icon } from "@/components/client/atoms/Icon";
import { Title } from "@/components/client/atoms/Title";
import { Text } from "@/components/client/atoms/Text";
import { Button } from "@/components/client/atoms/Button";
import { Chip } from "@/components/client/atoms/Chip";
import { MediaGrid, type MediaGridItem } from "@/components/client/molecules/MediaGrid";
import { ButtonTab } from "@/components/client/atoms/ButtonTab";
import { FormField } from '@/components/client/molecules/FormField';
import { TableRow } from "@/components/client/molecules/TableRow";
import type { TableCellConfig } from "@/components/client/molecules/TableRow/types";
import { PopUp } from '@/components/client/molecules/PopUp';

import styles from './JUZ01Detail.module.scss';
import { JUZ01DetailProps } from './types';
import { useRouter } from 'next/navigation';
import { TextArea } from '@/components/client/atoms/TextArea';


/**
 * DUMMY - BORRAAAAAAR
 */
type CaseStatus = "CREADO" | "EN_JUZGADO" | "ACOGIDO" | "NO_ACOGIDA";

type File = {
    id: string,
    name: string,
    sourceUrl: string,
    size: string
}

type Log = {
    userName: string,
    email: string,
    action: string,
    date: string,
    note: string
}

type Tag = {
    id: string;
    nombre: string;
    color?: string;
}

type Case = {
    caseNumber: string,
    tags: Tag[],
    caseDate: string,
    place: string,
    title: string,
    status: CaseStatus,
    placa: string,
    denuncia: {
        descripción: string,
        evidencias: File[]
    },
    defensa: {
        nombre: string,
        dpi: string,
        correo: string,
        telefono: string,
        argumentos: string,
        anexos: File[]
    }
    logs: Log[],
    resolucion?: {
        id: string,
        fecha: string,
        comentario: string,
        file: File
    },
    multa?: {
        ciudad: string,
        serie: string,
        numero: string,
        monto: number,
        placa: string,
        datosPago: {
            estado: string,
            monto: string,
            referencia: string,
        }
    }
}

const cases: Case[] = [
    // Caso recien creado
    {
        caseNumber: "1",
        tags: [
            {
                id: "1",
                nombre: "Registrado en Web",
                color: "#000000",
            },
            {
                id: "2",
                nombre: "Pendiente de recepción",
            },
        ],
        caseDate: "2026-01-01",
        place: "Ciudad de Guatemala",
        title: "Caso de prueba",
        status: "CREADO",
        placa: "P123DFB",
        denuncia: {
            descripción: "Descripción de la denuncia",
            evidencias: [
                {
                    id: "1",
                    name: "Evidencia 1",
                    sourceUrl: "/images/no-user.png",
                    size: "100KB",
                },
                {
                    id: "2",
                    name: "Evidencia 2",
                    sourceUrl: "/images/city.png",
                    size: "100KB",
                },
                {
                    id: "3",
                    name: "Evidencia 3",
                    sourceUrl: "/images/image.png",
                    size: "100KB",
                },
            ],
        },
        defensa: {
            nombre: "Nombre de la defensa",
            dpi: "1234567890",
            correo: "defensa@gmail.com",
            telefono: "1234567890",
            argumentos: "Argumentos de la defensa",
            anexos: [
                {
                    id: "1",
                    name: "Anexo 1",
                    sourceUrl: "/images/no-user.png",
                    size: "100KB",
                },
                {
                    id: "2",
                    name: "Anexo 2",
                    sourceUrl: "/images/login-info.png",
                    size: "100KB",
                },
            ],
        },
        logs: [
            {
                userName: "Juan Perez",
                email: "juan.perez@gmail.com",
                action: "Registrado en Web",
                date: "2026-01-01",
                note: "Caso de prueba",
            },
        ],
    },
    // Caso recibido en juzgado
    {
        caseNumber: "2",
        tags: [
            {
                id: "1",
                nombre: "Registrado en Web",
                color: "#000000",
            },
            {
                id: "2",
                nombre: "Recibido en juzgado",
            },
            {
                id: "3",
                nombre: "En revisión",
                color: "#F59E0B",
            }
        ],
        caseDate: "2026-01-01",
        place: "Ciudad de Guatemala. 2da Calle 23-45 Zona 10",
        title: "Caso de prueba",
        status: "EN_JUZGADO",
        placa: "P123DFB",
        denuncia: {
            descripción: "El vehículo se estacionó en la acera de la calle 123, y el conductor no se detuvo. La placa del vehículo es P123DFB. Se adjunta una imagen de la placa del vehículo. Y una imagen de la escena del accidente.. Además, se adjunta una imagen de la escena del accidente. Cabe destacar que el conductor no se detuvo y continuó conduciendo. La imagen de la placa del vehículo es P123DFB. La imagen de la escena del accidente es la siguiente: ...",
            evidencias: [
                {
                    id: "1",
                    name: "Evidencia 1",
                    sourceUrl: "/images/no-user.png",
                    size: "100KB",
                },
                {
                    id: "2",
                    name: "Evidencia 2",
                    sourceUrl: "/images/city.png",
                    size: "100KB",
                },
                {
                    id: "3",
                    name: "Evidencia 3",
                    sourceUrl: "/images/image.png",
                    size: "100KB",
                },
                {
                    id: "4",
                    name: "Evidencia 4.pdf",
                    sourceUrl: "/images/image.png",
                    size: "100KB",
                },
                {
                    id: "5",
                    name: "Evidencia 4.docx",
                    sourceUrl: "/images/image.png",
                    size: "100KB",
                },
            ],
        },
        defensa: {
            nombre: "Nombre de la defensa",
            dpi: "1234567890",
            correo: "defensa@gmail.com",
            telefono: "1234567890",
            argumentos: "El vehículo se estacionó en la acera de la calle 123, y el conductor no se detuvo. La placa del vehículo es P123DFB. Se adjunta una imagen de la placa del vehículo. Y una imagen de la escena del accidente.. Además, se adjunta una imagen de la escena del accidente. Cabe destacar que el conductor no se detuvo y continuó conduciendo. La imagen de la placa del vehículo es P123DFB. La imagen de la escena del accidente es la siguiente: ...",
            anexos: [
                {
                    id: "1",
                    name: "Anexo 1",
                    sourceUrl: "/images/no-user.png",
                    size: "100KB",
                },
                {
                    id: "2",
                    name: "Anexo 2",
                    sourceUrl: "/images/login-info.png",
                    size: "100KB",
                },
            ],
        },
        logs: [
            {
                userName: "Juan Perez",
                email: "juan.perez@gmail.com",
                action: "Registrado en Web",
                date: "2026-01-01",
                note: "Caso de prueba",
            },
            {
                userName: "Maria Gomez",
                email: "maria.gomez@gmail.com",
                action: "Recibido en juzgado",
                date: "2026-01-01 10:00:00",
                note: "Caso recibido en juzgado",
            },
            {
                userName: "Jorge Juan",
                email: "jorge.juarez@gmail.com",
                action: "Registró su defensa",
                date: "2026-01-02 10:00:00",
                note: "Caso registró su defensa",
            }
        ],
    },
    // Caso acogido
    {
        caseNumber: "3",
        tags: [
            {
                id: "1",
                nombre: "Acogido",
                color: "#80B918",
            },
            {
                id: "2",
                nombre: "Archivado",
            },
        ],
        caseDate: "2026-01-01",
        place: "2da Calle 23-45 Zona 10",
        title: "Caso de prueba",
        status: "ACOGIDO",
        placa: "P123DFB",
        denuncia: {
            descripción: "El vehículo se estacionó en la acera de la calle 123, y el conductor no se detuvo. La placa del vehículo es P123DFB. Se adjunta una imagen de la placa del vehículo. Y una imagen de la escena del accidente.. Además, se adjunta una imagen de la escena del accidente. Cabe destacar que el conductor no se detuvo y continuó conduciendo. La imagen de la placa del vehículo es P123DFB. La imagen de la escena del accidente es la siguiente: ...",
            evidencias: [
                {
                    id: "1",
                    name: "Evidencia 1",
                    sourceUrl: "/images/no-user.png",
                    size: "100KB",
                },
                {
                    id: "2",
                    name: "Evidencia 2",
                    sourceUrl: "/images/city.png",
                    size: "100KB",
                },
                {
                    id: "3",
                    name: "Evidencia 3",
                    sourceUrl: "/images/image.png",
                    size: "100KB",
                },
            ],
        },
        defensa: {
            nombre: "Nombre de la defensa",
            dpi: "1234567890",
            correo: "defensa@gmail.com",
            telefono: "1234567890",
            argumentos: "El vehículo se estacionó en la acera de la calle 123, y el conductor no se detuvo. La placa del vehículo es P123DFB. Se adjunta una imagen de la placa del vehículo. Y una imagen de la escena del accidente.. Además, se adjunta una imagen de la escena del accidente. Cabe destacar que el conductor no se detuvo y continuó conduciendo. La imagen de la placa del vehículo es P123DFB. La imagen de la escena del accidente es la siguiente: ...",
            anexos: [
                {
                    id: "1",
                    name: "Anexo 1",
                    sourceUrl: "/images/no-user.png",
                    size: "100KB",
                },
                {
                    id: "2",
                    name: "Anexo 2",
                    sourceUrl: "/images/login-info.png",
                    size: "100KB",
                },
            ],
        },
        logs: [
            {
                userName: "Juan Perez",
                email: "juan.perez@gmail.com",
                action: "Registrado en Web",
                date: "2026-01-01",
                note: "Caso de prueba",
            },
            {
                userName: "Maria Gomez",
                email: "maria.gomez@gmail.com",
                action: "Recibido en juzgado",
                date: "2026-01-01 10:00:00",
                note: "Caso recibido en juzgado",
            },
            {
                userName: "Jorge Juan",
                email: "jorge.juarez@gmail.com",
                action: "Registró su defensa",
                date: "2026-01-02 10:00:00",
                note: "Caso registró su defensa",
            },
            {
                userName: "Margia Gomez",
                email: "margia.gomez@gmail.com",
                action: "Acogido",
                date: "2026-01-03 10:00:00",
                note: "Caso acogido y archivado",
            }
        ],
        resolucion: {
            id: "1",
            fecha: "2026-01-04",
            comentario: "Analizando la denuncia y la defensa determiné que el conductor no se detuvo y continuó conduciendo. La imagen de la placa del vehículo es P123DFB. La imagen de la escena del accidente es la siguiente: ...",
            file: {
                id: "1",
                name: "Resolución",
                sourceUrl: "/images/no-user.png",
                size: "100KB",
            }
        }
    },
    // Caso acogido
    {
        caseNumber: "4",
        tags: [
            {
                id: "1",
                nombre: "No acogido",
                color: "#EF4444",
            },
            {
                id: "2",
                nombre: "Remisión emitida",
            },
        ],
        caseDate: "2026-01-01",
        place: "2da Calle 23-45 Zona 10",
        title: "Caso de prueba",
        status: "NO_ACOGIDA",
        placa: "P123DFB",
        denuncia: {
            descripción: "El vehículo se estacionó en la acera de la calle 123, y el conductor no se detuvo. La placa del vehículo es P123DFB. Se adjunta una imagen de la placa del vehículo. Y una imagen de la escena del accidente.. Además, se adjunta una imagen de la escena del accidente. Cabe destacar que el conductor no se detuvo y continuó conduciendo. La imagen de la placa del vehículo es P123DFB. La imagen de la escena del accidente es la siguiente: ...",
            evidencias: [
                {
                    id: "1",
                    name: "Evidencia 1",
                    sourceUrl: "/images/no-user.png",
                    size: "100KB",
                },
                {
                    id: "2",
                    name: "Evidencia 2",
                    sourceUrl: "/images/city.png",
                    size: "100KB",
                },
                {
                    id: "3",
                    name: "Evidencia 3",
                    sourceUrl: "/images/image.png",
                    size: "100KB",
                },
            ],
        },
        defensa: {
            nombre: "Nombre de la defensa",
            dpi: "1234567890",
            correo: "defensa@gmail.com",
            telefono: "1234567890",
            argumentos: "El vehículo se estacionó en la acera de la calle 123, y el conductor no se detuvo. La placa del vehículo es P123DFB. Se adjunta una imagen de la placa del vehículo. Y una imagen de la escena del accidente.. Además, se adjunta una imagen de la escena del accidente. Cabe destacar que el conductor no se detuvo y continuó conduciendo. La imagen de la placa del vehículo es P123DFB. La imagen de la escena del accidente es la siguiente: ...",
            anexos: [
                {
                    id: "1",
                    name: "Anexo 1",
                    sourceUrl: "/images/no-user.png",
                    size: "100KB",
                },
                {
                    id: "2",
                    name: "Anexo 2",
                    sourceUrl: "/images/login-info.png",
                    size: "100KB",
                },
            ],
        },
        logs: [
            {
                userName: "Juan Perez",
                email: "juan.perez@gmail.com",
                action: "Registrado en Web",
                date: "2026-01-01",
                note: "Caso de prueba",
            },
            {
                userName: "Maria Gomez",
                email: "maria.gomez@gmail.com",
                action: "Recibido en juzgado",
                date: "2026-01-01 10:00:00",
                note: "Caso recibido en juzgado",
            },
            {
                userName: "Jorge Juan",
                email: "jorge.juarez@gmail.com",
                action: "Registró su defensa",
                date: "2026-01-02 10:00:00",
                note: "Caso registró su defensa",
            },
            {
                userName: "Margia Gomez",
                email: "margia.gomez@gmail.com",
                action: "Acogido",
                date: "2026-01-03 10:00:00",
                note: "Caso acogido y archivado",
            }
        ],
        resolucion: {
            id: "1",
            fecha: "2026-01-04",
            comentario: "Analizando la denuncia y la defensa determiné que el conductor no se detuvo y continuó conduciendo. La imagen de la placa del vehículo es P123DFB. La imagen de la escena del accidente es la siguiente: ...",
            file: {
                id: "1",
                name: "Resolución",
                sourceUrl: "/images/no-user.png",
                size: "100KB",
            }
        },
        multa: {
            ciudad: "Ciudad de Guatemala",
            serie: "1234567890",
            numero: "1234567890",
            placa: "P123DFB",
            monto: 100,
            datosPago: {
                estado: "Pendiente",
                monto: "100",
                referencia: "1234567890",
            }
        }
    },
]
/////////////////////////////

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
const VIDEO_EXTENSIONS = ["mp4", "webm", "ogg", "mov"];

const getExtension = (value: string) => {
    const filename = value.split("?")[0].split("/").pop() ?? value;
    const ext = filename.includes(".") ? filename.split(".").pop() : "";
    return ext?.toLowerCase() ?? "";
};

const toMediaGridItem = (file: File): MediaGridItem => {
    const ext = getExtension(file.name) || getExtension(file.sourceUrl);

    if (IMAGE_EXTENSIONS.includes(ext)) {
        return {
            type: "image",
            src: file.sourceUrl,
            alt: file.name,
            width: 320,
            height: 180,
        };
    }

    if (VIDEO_EXTENSIONS.includes(ext)) {
        return {
            type: "video",
            src: file.sourceUrl,
        };
    }

    return {
        type: "file",
        id: file.id,
        name: file.name,
        download: true,
        onClick: () => {
            alert(`Descargar archivo id: ${file.id}`);
        },
    };
};

const LOG_GRID = "minmax(0,0.5fr) minmax(0,0.3fr) minmax(0,1fr) minmax(0,0.2fr) minmax(0,1fr)";

const LOG_HEADER: TableCellConfig[] = [
    { label: "Nombre", icon: "user-solid" },
    { label: "Correo", icon: "mail-solid" },
    { label: "Acción", icon: "ticket" },
    { label: "Fecha", icon: "calendar-regular" },
    { label: "Nota", icon: "briefcase-solid" },
];
const JUZ01Detail: React.FC<JUZ01DetailProps> = ({ caseNumber }) => {

    const [currentCase, setCurrentCase] = useState<Case | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<{ message: string } | null>(null); // Error al cargar el caso
    const [errorSendResolution, setErrorSendResolution] = useState<{ message: string } | null>(null); // Error al enviar la resolución
    const router = useRouter();

    const [showConfirmReceiptModal, setShowConfirmReceiptModal] = useState(false);
    const [showSendResolutionModal, setShowSendResolutionModal] = useState(false);
    const [showResolveDefense, setShowResolveDefense] = useState(false);
    const [resolveCaseValue, setResolveCaseValue] = useState("acogido");
    const [fundament, setFundament] = useState("");
    const [isSendingResolution, setIsSendingResolution] = useState(false);

    useMemo(() => {
        setIsLoading(true);
        setError(null);
        
        setTimeout(() => {
            const caseData = cases.find(c => c.caseNumber === caseNumber);

            // if (Math.random() > 0.7) {
            //     setError({ message: "Error al cargar el caso" });
            //     setIsLoading(false);
            //     return;
            // }

            if (caseData) {
                setCurrentCase(caseData);
            }
            setIsLoading(false);
        }, 1000);

    }, [caseNumber]);

    const handleConfirmReceipt = () => {
        console.log("Confirmar recepción de papelería");
        setShowConfirmReceiptModal(false);
        router.replace(`/home/juridico/juz01/juz01/detail?caseNumber=2`);
    }

    const handleSendResolution = () => {
        setErrorSendResolution(null);
        if (fundament.trim() === "") {
            alert("El fundamento es requerido para enviar la resolución");
            setShowSendResolutionModal(false);
            return;
        }

        setShowSendResolutionModal(false);
        setIsSendingResolution(true);
        if (Math.random() > 0.5) {
            setErrorSendResolution({ message: "Error al enviar la resolución" });
            setIsSendingResolution(false);
            return;
        }
        setTimeout(() => {
            setIsSendingResolution(false);
        }, 5000);
        console.log("Resolucion enviada con:");
        console.log(resolveCaseValue);
        console.log(fundament);
    }

    if (isLoading) {
        return (
            <div className={classNames(styles.mainContainer, styles.loading)}>
                <Text variant="body">Cargando caso...</Text>
            </div>
        );
    }

    if (error) {
        return (
            <div className={classNames(styles.mainContainer, styles.error)}>
                <Text variant="body">{error.message}</Text>
                <Button variant="contained" onClick={() => router.back()}>Volver</Button>
            </div>
        );
    }

    if (!currentCase) {
        return (
            <div className={classNames(styles.mainContainer, styles.notFound)}>
                <Text variant="body">No se encontró el caso</Text>
                <Button variant="contained" onClick={() => router.back()}>Volver</Button>
            </div>
        );
    }

    return (
        <div className={styles.mainContainer}>
            <div className={styles.header}>
                <div className={styles.headerInfo}>
                    <Icon name="file" variant="status" color="#7F8D9F" />
                    <Title variant="mid" className={styles.title}>Caso #{currentCase.caseNumber}</Title>
                </div>
                <Title variant="mid" className={styles.title}>{currentCase.caseDate} - {currentCase.place}</Title>
            </div>
            <Title variant="large">{currentCase.title} - {currentCase.placa}</Title>
            <div className={styles.tags}>
                {currentCase.tags.map((tag) => (
                    <Chip key={tag.id} label={tag.nombre} color={tag.color} />
                ))}
            </div>
            {currentCase.status !== "ACOGIDO" && currentCase.status !== "NO_ACOGIDA" && !showResolveDefense && (
                <div className={styles.actions}>
                    <Title variant="mid" className={styles.title}>Acciones disponibles</Title>
                    {currentCase.status === "CREADO" ? (
                        <Button variant="contained" onClick={() => setShowConfirmReceiptModal(true)}>Confirmar recepción de papelería</Button>
                    ) : currentCase.status === "EN_JUZGADO" ? (
                        <Button variant="contained" onClick={() => setShowResolveDefense(true)}>Resolver defensa</Button>
                    ) : <Text variant="body">No hay acciones disponibles</Text>}
                </div>
            )}
            <Title variant="mid" className={styles.title}>Descripción</Title>
            <Text variant="body">{currentCase.denuncia.descripción}</Text>
            <Title variant="mid" className={styles.title}>Evidencias</Title>
            <MediaGrid
                columns={3}
                items={currentCase.denuncia.evidencias.map(toMediaGridItem)}
            />
            <Title variant="mid">Defensa</Title>
            <div className={styles.defensePersonalData}>
                <div className={styles.defensePersonalDataItem}>
                    <Text variant="body"><strong>Nombre</strong></Text>
                    <Text variant="body">{currentCase.defensa.nombre}</Text>
                </div>
                <div className={styles.defensePersonalDataItem}>
                    <Text variant="body"><strong>DPI</strong></Text>
                    <Text variant="body">{currentCase.defensa.dpi}</Text>
                </div>
                <div className={styles.defensePersonalDataItem}>
                    <Text variant="body"><strong>Correo</strong></Text>
                    <Text variant="body">{currentCase.defensa.correo}</Text>
                </div>
                <div className={styles.defensePersonalDataItem}>
                    <Text variant="body"><strong>Teléfono</strong></Text>
                    <Text variant="body">{currentCase.defensa.telefono}</Text>
                </div>
            </div>
            <Title variant="mid" className={styles.title}>Argumentos</Title>
            <Text variant="body">{currentCase.defensa.argumentos}</Text>
            <Title variant="mid" className={styles.title}>Anexos</Title>
            <MediaGrid
                columns={3}
                items={currentCase.defensa.anexos.map(toMediaGridItem)}
            />
            {showResolveDefense && (
                <>
                    <Title variant="large">Resolver</Title>
                    <div className={styles.resolveCaseForm}>
                        <ButtonTab options={[
                            { label: "Acogido", value: "acogido" },
                            { label: "No acogido", value: "no_acogido" },
                        ]} value={resolveCaseValue} onChange={setResolveCaseValue} />
                        <FormField label="Fundamento" htmlFor="fundament" required className={styles.fundamentFormField}>
                            <TextArea
                                id="fundament"
                                onInput={(e) => {
                                    const el = e.currentTarget;
                                    el.style.height = "auto";
                                    el.style.height = `${el.scrollHeight}px`;
                                }}
                                className={styles.fundamentTextArea}
                                onChange={(e) => setFundament(e.target.value)}
                            />
                        </FormField>
                        <Button
                            variant="contained"
                            color="default"
                            onClick={() => setShowSendResolutionModal(true)}
                            className={styles.executeButton}
                            state={isSendingResolution ? "disabled" : "default"}
                        >
                            {isSendingResolution ? 'Enviando resolución...' : 'Enviar resolución'}
                        </Button>
                    </div>
                </>
            )}
            <Title variant="mid" className={styles.title}>Bitácora de cambios</Title>
            <div className={styles.tableContainer}>
                <TableRow isHeader gridTemplate={LOG_GRID} cells={LOG_HEADER} />
                {currentCase.logs.map((log, i) => (
                    <TableRow
                        key={i}
                        gridTemplate={LOG_GRID}
                        scale={0.8}
                        cells={[
                            { content: <Text variant="muted">{log.userName}</Text> },
                            { content: <Text variant="muted">{log.email}</Text> },
                            { content: <Text variant="muted">{log.action}</Text> },
                            { content: <Text variant="muted">{log.date}</Text> },
                            { content: <Text variant="muted">{log.note}</Text> },
                        ] as TableCellConfig[]}
                    />
                ))}
            </div>
            
            <PopUp
                isOpen={showConfirmReceiptModal}
                onClose={() => setShowConfirmReceiptModal(false)}
                title="Confirmar recepción de denuncia"
                description={`Al presionar el botón Confirmar indicará que la papelería fue recibida por parte de usted, Juez.\nUna vez recibida la papelería, deberá de analizar la defensa del caso y emitir una resolución.`}
                actions={[
                    {
                        text: "Confirmar",
                        color: "success",
                        onClick: () => handleConfirmReceipt(),
                    },
                    {
                        text: "Cancelar",
                        color: "danger",
                        onClick: () => setShowConfirmReceiptModal(false),
                    }
                ]}
            />

            <PopUp
                isOpen={showSendResolutionModal}
                onClose={() => setShowSendResolutionModal(false)}
                title={resolveCaseValue === "acogido" ? "Seguro que desea Acoger la defensa" : "Seguro que desea No Acoger la defensa"}
                description={resolveCaseValue === "acogido" ? `Esta acción hará que el denunciado sea exonerado de la denuncia.\n\nNota: El caso pasará a Archivado` : `Esta acción hará que al denunciado se le coloque la Multa correspondiente.`}
                actions={[
                    {
                        text: "Confirmar",
                        color: "success",
                        onClick: () => handleSendResolution(),
                    },
                    {
                        text: "Cancelar",
                        color: "danger",
                        onClick: () => setShowSendResolutionModal(false),
                    }
                ]}
            />

            <PopUp
                isOpen={!!errorSendResolution}
                onClose={() => setErrorSendResolution(null)}
                title="Error al enviar la resolución"
                description={errorSendResolution?.message ?? "Ocurrió un error al enviar la resolución. Por favor, inténtelo nuevamente."}
                actions={[
                    {
                        text: "Reintentar",
                        color: "success",
                        onClick: () => handleSendResolution(),
                    },
                ]}
            />
        </div>
    );
};

export default JUZ01Detail;
