"use client";

import { useState, useEffect } from "react";
import { SearchField } from "@/components/client/molecules/SearchField";
import { ButtonTab } from "@/components/client/atoms/ButtonTab";
import { TableHeader } from "@/components/client/molecules/TableHeader";
import { TableRow } from "@/components/client/molecules/TableRow";
import { Text } from "@/components/client/atoms/Text";
import { Button } from "@/components/client/atoms/Button";
import { Icon } from "@/components/client/atoms/Icon";
import { Link } from "@/components/client/atoms/Link";
import { identifyLink } from "@/utils/utils";
import Image from "next/image";
import SolveCasilleroUserRequestModal from "@/components/client/organisms/SolveCasilleroUserRequestModal";

import styles from "./CasilleroUserRequests.module.scss";

type newUserRequest = {
	id: string,
	email: string,
    userType: "individual" | "juridico",
	dpi: string,
	nit: string,
}

type individualUser = {
    id: string,
    userType: "individual",
    firstName: string,
    secondName: string,
    firstLastName: string,
    secondLastName: string,
    email: string,
    nit: string,
    birthDate: string,
    nationality: string,
    residenceCountry: string,
    dpi: string,
    documentCountry: string,
    documentDate: string,
    documentExpirationDate: string,
    dpiFile: string,
}

type juridicUser = {
    id: string,
    userType: "juridico",
    dpi: string,
    nit: string,
    rtu: string,
    legalRepresentative: string,
    email: string,
    phone: string,
}

const initialNewUserRequests: newUserRequest[] = [
	{
		id: "1",
		userType: "individual",
		email: "juan.perez@example.com",
		dpi: "1234567891234",
		nit: "1234567890",
	},
	{
		id: "2",
		userType: "juridico",
		email: "maria.gomez@example.com",
		dpi: "1234567893214",
		nit: "1234567890",
	},
    {
		id: "3",
		userType: "individual",
		email: "pedro.rodriguez@example.com",
		dpi: "1234567894321",
		nit: "1234567890",
	},
    {
		id: "4",
		userType: "juridico",
		email: "ana.lopez@example.com",
		dpi: "1234567894568",
		nit: "1234567890",
	},
]

const initialIndividualsUsers: individualUser[] = [
    {
        id: "1",
        userType: "individual",
        firstName: "Juan",
        secondName: "Pedro",
        firstLastName: "Perez",
        secondLastName: "Gomez",
        email: "juan.perez@example.com",
        nit: "1234567890",
        birthDate: "1990-01-01",
        nationality: "Guatemala",
        residenceCountry: "Guatemala",
        dpi: "1234567891234",
        documentCountry: "Guatemala",
        documentDate: "2020-01-01",
        documentExpirationDate: "2025-01-01",
        dpiFile: "https://i.pravatar.cc/300?img=68",
    },
    {
        id: "3",
        userType: "individual",
        firstName: "Maria",
        secondName: "Juana",
        firstLastName: "Gomez",
        secondLastName: "Perez",
        email: "maria.gomez@example.com",
        nit: "1234567890",
        birthDate: "1990-01-01",
        nationality: "Guatemala",
        residenceCountry: "Guatemala",
        dpi: "1234567891234",
        documentCountry: "Guatemala",
        documentDate: "2020-01-01",
        documentExpirationDate: "2025-01-01",
        dpiFile: "https://i.pravatar.cc/300?img=68",
    },
]

const initialJuridicUsers: juridicUser[] = [
    {
        id: "1",
        userType: "juridico",
        dpi: "1234567891234",
        nit: "1234567890",
        rtu: "https://drive.google.com/file/d/1234567890/view?usp=sharing",
        legalRepresentative: "https://drive.google.com/file/d/1234567890/view?usp=sharing",
        email: "juan.perez@example.com",
        phone: "50212345678",
    },
    {
        id: "4",
        userType: "juridico",
        dpi: "1234567891234",
        nit: "1234567890",
        rtu: "https://drive.google.com/file/d/1234567890/view?usp=sharing",
        legalRepresentative: "https://drive.google.com/file/d/1234567890/view?usp=sharing",
        email: "maria.gomez@example.com",
        phone: "50212345678",
    },
]

const GRID = "minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.8fr) minmax(0, 1fr)";

const TABS = [
    { label: "Todos", value: "todos" },
    { label: "Individual", value: "individual" },
    { label: "Jurídico", value: "juridico" },
]

// MOCK
const filterRequests = (requests: newUserRequest[], query: string, userType: string) => {
    const normalizedQuery = query.trim().toLowerCase();

    return requests.filter((request) => {
        const matchesType = userType === "todos" || request.userType === userType;
        const matchesSearch = normalizedQuery === ""
            || request.email.toLowerCase().includes(normalizedQuery)
            || request.dpi.toLowerCase().includes(normalizedQuery)
            || request.nit.toLowerCase().includes(normalizedQuery);

        return matchesType && matchesSearch;
    });
};

const CasilleroUserRequests: React.FC = () => {

    const [searchValue, setSearchValue] = useState<string>("");
    const [selectedTab, setSelectedTab] = useState("todos");
    const [newUserRequests, setNewUserRequests] = useState<newUserRequest[]>([]);
    const [requestId, setRequestId] = useState<string | null>(null);
    const [request, setRequest] = useState<individualUser | juridicUser | null>(null);

    const [isSolveCasilleroUserRequestModalOpen, setIsSolveCasilleroUserRequestModalOpen] = useState(false);
    const [approve, setApprove] = useState(false);

    useEffect(() => {
        setNewUserRequests(initialNewUserRequests);
    }, []);

    const handleViewDetail = (id: string) => {
        setRequestId(id);
        const requestType = newUserRequests.find((request) => request.id === id)?.userType;
        if (requestType === "individual") {
            setRequest(initialIndividualsUsers.find((user) => user.id === id) as individualUser);
        } else {
            setRequest(initialJuridicUsers.find((user) => user.id === id) as juridicUser);
        }
    };

    const handleBack = () => {
        setRequestId(null);
        setRequest(null);
    };

    // MOCK
    const visibleRequests = filterRequests(newUserRequests, searchValue, selectedTab);

    const handleAccept = (id: string) => {
        console.log("accept", id);
        setIsSolveCasilleroUserRequestModalOpen(true);
        setApprove(true);
    };

    const handleReject = (id: string) => {
        console.log("reject", id);
        setIsSolveCasilleroUserRequestModalOpen(true);
        setApprove(false);
    };

    const handleSolveCasilleroUserRequest = () => {
        alert(`Se ${approve ? "aprobo" : "rechazo"} la solicitud de usuario ${request?.userType === "individual" ? (request as individualUser).firstName + " " + (request as individualUser).firstLastName : request?.email}`);
        setIsSolveCasilleroUserRequestModalOpen(false);
    };

    const renderUserInfoItem = (key: string, value: string) => {
        return (
            <div className={styles.userInfoItem}>
                <Text variant="body"><strong>{key}</strong></Text>
                {identifyLink(value) ? <Link className={styles.link} href={value} target="_blank">Enlace</Link> : <Text variant="body">{value}</Text>}
            </div>
        );
    };

    const renderUserInfo = (request: individualUser | juridicUser) => {
        return (
            <div className={styles.userInfoContent}>
                {request.userType === "individual" ? (
                    <>
                        {renderUserInfoItem("Nombre", request.firstName + " " + request.secondName + " " + request.firstLastName + " " + request.secondLastName)}
                        {/* {renderUserInfoItem("DPI", request.dpi)}
                        {renderUserInfoItem("NIT", request.nit)} */}
                        {renderUserInfoItem("Fecha de nacimiento", request.birthDate)}
                        {renderUserInfoItem("País de residencia", request.residenceCountry)}
                        {renderUserInfoItem("País de nacionalidad", request.nationality)}
                        {renderUserInfoItem("País de documento", request.documentCountry)}
                        {renderUserInfoItem("Fecha de documento", request.documentDate)}
                        {renderUserInfoItem("Fecha de expiración del documento", request.documentExpirationDate)}
                    </>
                ) : (
                    <>
                        {/* {renderUserInfoItem("DPI", request.dpi)}
                        {renderUserInfoItem("NIT", request.nit)} */}
                        {renderUserInfoItem("RTU", request.rtu)}
                        {renderUserInfoItem("Representante legal", request.legalRepresentative)}
                        {renderUserInfoItem("Teléfono", request.phone)}
                        {renderUserInfoItem("Correo electrónico", request.email)}
                        {renderUserInfoItem("Teléfono", request.phone)}
                    </>
                )}
            </div>
        );
    };

    return (
        <div className={styles.mainContainer}>
            {request ? (
                <div className={styles.detailContainer}>
                    <Button className={styles.backButton} variant="text" icon="arrow-left-solid" left onClick={handleBack}>Volver a solicitudes</Button>

                    <div className={styles.header}>
                        <TableHeader 
                            iconName="papers-solid"
                            label="Detalle de solicitud"
                        />
                        <div className={styles.actions}>
                            <Button variant="outlined" icon="cross-solid" left color="danger" onClick={() => handleReject(requestId!)}>Rechazar</Button>
                            <Button variant="outlined" icon="check-solid" left color="success" onClick={() => handleAccept(requestId!)}>Aceptar</Button>
                        </div>
                    </div>

                    <div className={styles.resumeContainer}>
                        <div className={styles.userAvatar}>
                            <Icon name="user-regular" variant="status" backgroundColor="#10BFEE91" color="#4361EE" />
                            <div className={styles.userAvatarContent}>
                                <Text variant="body">{request.userType === "individual" ? request.firstName + " " + request.firstLastName : "Usuario Jurídico"}</Text>
                                <Text variant="caption">{request.userType === "individual" ? "Usuario Individual" : "Usuario Jurídico"}</Text>
                            </div>
                        </div>

                        <div className={styles.infoItem}>
                            <Icon name="mail-solid" variant="status" />
                            <div className={styles.infoItemContent}>
                                <Text variant="body">{request.email}</Text>
                                <Text variant="caption">Correo electrónico</Text>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <Icon name="file-lines-regular" variant="status" />
                            <div className={styles.infoItemContent}>
                                <Text variant="body">{request.dpi}</Text>
                                <Text variant="caption">DPI</Text>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <Icon name="briefcase-solid" variant="status" />
                            <div className={styles.infoItemContent}>
                                <Text variant="body">{request.nit}</Text>
                                <Text variant="caption">NIT</Text>
                            </div>
                        </div>
                    </div>

                    <div className={styles.content}>
                        <div className={styles.userInfoContainer}>
                            <Text>Datos personales</Text>
                            {renderUserInfo(request)}
                        </div>
                        {request.userType === "individual" && (
                            <div className={styles.userDocumentsContainer}>
                                <Text>Documentos</Text>
                                <Image className={styles.dpiImage} src={request.dpiFile} alt="DPI" width={100} height={100} />
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <div className={styles.filtersContainer}>
                        <SearchField
                            placeholder="Buscar por correo"
                            value={searchValue}
                            onChange={setSearchValue}
                            onSearch={() => {}}
                        />
                        <ButtonTab
                            options={TABS}
                            value={selectedTab}
                            onChange={setSelectedTab}
                        />
                    </div>

                    <div className={styles.table}>

                        <TableRow 
                            isHeader
                            gridTemplate={GRID}
                            cells={[
                                { icon: "envelope-regular", label: "Correo"},
                                { icon: "user-regular", label: "Tipo de usuario"},
                                { icon: "file-lines-regular", label: "DPI"},
                                { icon: "briefcase-solid", label: "NIT"},
                                { icon: "gears-solid", label: "Acciones", align: "center" }
                            ]}
                        />

                        { visibleRequests.length > 0 ? visibleRequests.map((newUserRequest) => (
                            <TableRow 
                                key={newUserRequest.id}
                                id={newUserRequest.id}
                                gridTemplate={GRID}
                                scale={0.9}
                                cells={[
                                    { content: <Text>{newUserRequest.email}</Text>},
                                    { content: <Text>{newUserRequest.userType}</Text>},
                                    { content: <Text>{newUserRequest.dpi}</Text>},
                                    { content: <Text>{newUserRequest.nit}</Text>},
                                    { content: <Button variant="text" icon="eye" left onClick={() => handleViewDetail(newUserRequest.id)}>Ver detalle</Button> },
                                ]}
                            />
                        )) : <TableRow gridTemplate={GRID} cells={[
                            { content: <Text>Sin resultados</Text> },
                        ]} />}

                    </div>
                </>
            )}

        <SolveCasilleroUserRequestModal
            isOpen={isSolveCasilleroUserRequestModalOpen}
            onClose={() => setIsSolveCasilleroUserRequestModalOpen(false)}
            approve={approve}
            onSubmit={handleSolveCasilleroUserRequest}
            email={request?.email || ""}
            userType={request?.userType || ""}
            name={request?.userType === "individual" ? (request as individualUser).firstName + " " + (request as individualUser).firstLastName : undefined}
        />

        </div>
    );
};

export default CasilleroUserRequests;