export interface Request {
    id: number;
    name: string;
    email: string;
    employeeNumber: string;
    budget: string;
    position: string;
    status: string;
};

export interface RequestTableProps {
    requests: Request[];
    onApprove?: (ids: number[]) => void;
    className?: string;
};
