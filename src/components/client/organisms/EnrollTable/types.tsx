export interface Enroll {
    id: number;
    name: string;
    department: string;
    employeeNumber: string;
    permission: string;
    status: string;
};

export interface EnrollTableProps {
    enroll: Enroll[];
    onApprove?: (ids: number[]) => void;
    className?: string;
};
