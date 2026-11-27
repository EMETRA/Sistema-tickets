"use client";
import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { GUIDED_TOUR, type TourAudience } from "@/config/guided-tour";
import { usePlatform } from "@/platform/context";
import { closeTour, startTour, tourSeen, useTourOpen } from "@/platform/tour";
import { GuidedTour } from "./GuidedTour";

/**
 * Monta el recorrido en el layout: lo ofrece solo la primera vez que alguien
 * llega al Inicio (no en pruebas automatizadas) y filtra los pasos por perfil.
 */
export function GuidedTourHost({ autoStart }: { autoStart: boolean }) {
    const open = useTourOpen();
    const pathname = usePathname();
    const { data } = usePlatform();
    const audiences = useMemo(() => {
        const set = new Set<TourAudience>(["todos"]);
        if (data?.actor.admin) set.add("administracion");
        if (data && data.actor.mode !== "USUARIO") set.add("personal-ti");
        if (data?.capabilities.assign || data?.capabilities.attend) set.add("mesa");
        return set;
    }, [data]);
    const steps = useMemo(
        () => GUIDED_TOUR.filter((s) => !s.audience || s.audience.some((a) => audiences.has(a))),
        [audiences],
    );
    useEffect(() => {
        if (!autoStart || pathname !== "/home" || tourSeen() || navigator.webdriver) return;
        const timer = setTimeout(startTour, 900);
        return () => clearTimeout(timer);
    }, [autoStart, pathname]);
    return (
        <GuidedTour
            steps={steps}
            open={open}
            onClose={(done) => closeTour(done ? "completado" : "omitido")}
        />
    );
}
