"use client";

import React, { useState } from 'react';
import { Title } from '../../components/client/atoms/Title';
import { FormField } from '../../components/client/molecules/FormField';
import { Input } from "../../components/client/atoms/Input";
import { Button } from '../../components/client/atoms/Button';
import { Text } from '../../components/client/atoms/Text';

import { SuccessModal } from '../../components/client/organisms/SucessModal';

import styles from './MOD04.module.scss';

const MOD04: React.FC = () => {
    const [company, setCompany] = useState<string>('');
    const [paystubType, setPaystubType] = useState<string>('');
    const [playrollManager, setPlayrollManager] = useState<string>('');
    const [paymentType, setPaymentType] = useState<number | undefined>();
    const [budgetUnit, setBudgetUnit] = useState<number | undefined>();

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const handleExecute = () => {
        if (company === '' || paystubType === '' || playrollManager === '' || paymentType === undefined || budgetUnit === undefined) {
            alert('Por favor, complete todos los campos antes de ejecutar el proceso.');
            return;
        }

        alert(`Ejecutando proceso con:\nEmpresa: ${company}\nTipo de Recibo: ${paystubType}\nGerente de Nómina: ${playrollManager}\nTipo de Pago: ${paymentType}\nUnidad de Presupuesto: ${budgetUnit}`);
        setIsModalOpen(true);
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.formContainer}>
                <Title variant="mid" tag="h3" className={styles.title}>Parámetros de consulta</Title>

                {/* Empresa */}
                <FormField label="Empresa" htmlFor="company" required className={styles.fieldCompany}>
                    <Input
                        id="company"
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Ingresa el nombre de la empresa"
                        // state={loading ? "disabled" : "default"}
                        required
                    />
                </FormField>

                {/* Tipo de nómina */}
                <FormField label="Tipo de nómina" htmlFor="paystubType" required className={styles.fieldPaystubType}>
                    <Input
                        id="paystubType"
                        type="text"
                        value={paystubType}
                        onChange={(e) => setPaystubType(e.target.value)}
                        placeholder="Ingresa el tipo de nómina"
                        // state={loading ? "disabled" : "default"}
                        required
                    />
                </FormField>

                {/* Maestro de Nómina */}
                <FormField label="Maestro de Nómina" htmlFor="payrollManager" required className={styles.fieldPayrollManager}>
                    <Input
                        id="payrollManager"
                        type="text"
                        value={playrollManager}
                        onChange={(e) => setPlayrollManager(e.target.value)}
                        placeholder="Ingresa el nombre del maestro de nómina"
                        // state={loading ? "disabled" : "default"}
                        required
                    />
                </FormField>

                {/* Tipo de pago (Ej. % o 01%) */}
                <FormField label="Tipo de Pago (Ej. % o 01%)" htmlFor="paymentType" required className={styles.fieldPaymentType}>
                    <Input
                        id="paymentType"
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        value={paymentType}
                        onChange={(e) => setPaymentType(+e.target.value)}
                        placeholder="Ingresa el tipo de pago"
                        // state={loading ? "disabled" : "default"}
                        required
                    />
                </FormField>

                {/* Unidad presupuestaria */}
                <FormField label="Unidad Presupuestaria (Ej. 12% o %)" htmlFor="budgetUnit" required className={styles.fieldBudgetUnit}>
                    <Input
                        id="budgetUnit"
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        value={budgetUnit}
                        onChange={(e) => setBudgetUnit(+e.target.value)}
                        placeholder="Ingresa el nombre de la unidad presupuestaria"
                        // state={loading ? "disabled" : "default"}
                        required
                    />
                </FormField>

                <Button
                    variant="contained"
                    color="default"
                    onClick={handleExecute}
                    className={styles.executeButton}
                >
                    Generar Reporte en Excel
                </Button>

                <Text variant="caption" className={styles.footerText}>
                    Dirección de Informática · Municipalidad de Guatemala
                </Text>
            </div>
            <SuccessModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                message="Excel generado correctamente"
            />
        </div>
    )
}

export default MOD04;
