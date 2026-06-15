import { create } from "zustand";
import { GuardarReporteSemanalResponse, GuardarReporteSemanalInput } from "@/api/graphql/apps/types";

interface ReporteSemanalStore {
    lastResult: GuardarReporteSemanalResponse | null;
    lastInput: GuardarReporteSemanalInput | null;
    setLastResult: (result: GuardarReporteSemanalResponse, input: GuardarReporteSemanalInput) => void;
    clear: () => void;
}

export const useReporteSemanalStore = create<ReporteSemanalStore>((set) => ({
    lastResult: null,
    lastInput: null,
    setLastResult: (result, input) => set({ lastResult: result, lastInput: input }),
    clear: () => set({ lastResult: null, lastInput: null }),
}));