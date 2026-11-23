"use client";
import { createContext, useContext, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePlatform } from "./context";
import type { PlatformContextData } from "./types";
import {
  isWorkspaceView,
  workspacePresentation,
  type WorkspaceViewSelection,
} from "./presentation";

type PresentationState = {
  data: PlatformContextData | null;
  mode: WorkspaceViewSelection;
  active: boolean;
  canChangeView: boolean;
  setMode: (mode: WorkspaceViewSelection) => void;
};
const Context = createContext<PresentationState>({
  data: null,
  mode: "ACTUAL",
  active: false,
  canChangeView: false,
  setMode: () => {},
});

export function WorkspaceViewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data } = usePlatform();
  const token = useAuthStore((state) => state.token);
  const [selection, setSelection] = useState<{
    actor: number;
    session: string;
    mode: WorkspaceViewSelection;
  } | null>(null);
  const canChangeView = Boolean(token && data?.actor.admin);
  const mode =
    canChangeView &&
    selection?.actor === data?.actor.id &&
    selection?.session === token
      ? selection.mode
      : "ACTUAL";
  const active = canChangeView && isWorkspaceView(mode);
  const setMode = (value: WorkspaceViewSelection) => {
    if (!canChangeView || !data || !token) return;
    if (value === "ACTUAL") setSelection(null);
    else if (isWorkspaceView(value))
      setSelection({ actor: data.actor.id, session: token, mode: value });
  };
  return (
    <Context.Provider
      value={{
        data: data ? workspacePresentation(data, mode) : null,
        mode,
        active,
        canChangeView,
        setMode,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useWorkspaceView() {
  return useContext(Context);
}
