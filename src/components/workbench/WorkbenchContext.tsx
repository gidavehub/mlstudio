"use client";
import React, { createContext, useContext, useMemo, useState } from "react";
import { useDataSelection } from "@/components/hooks/useDataSelection";
import { useCharts } from "@/components/hooks/useCharts";

export interface WorkbenchProviderProps {
  columns: string[];
  getPreview: (maxRows?: number) => { columns: string[]; rows: any[][] };
  stats: Array<{ column: string; type: string; count: number; missing: number; unique: number; min?: number; max?: number; mean?: number; std?: number; }>;
  title?: string;
  onBack?: () => void;
  onAction?: (action: { type: string; payload?: any }) => void;
  getSplitPreview?: (maxRows?: number) => { columns: string[]; training: any[][]; validation: any[][]; testing: any[][] };
  children: React.ReactNode;
}

interface WorkbenchContextValue {
  columns: string[];
  stats: WorkbenchProviderProps["stats"];
  title?: string;
  onBack?: () => void;
  onAction?: WorkbenchProviderProps["onAction"];
  getSplitPreview?: WorkbenchProviderProps["getSplitPreview"];

  preview: { columns: string[]; rows: any[][] };

  selectedCol: string | null;
  setSelectedCol: (c: string | null) => void;

  selectedCols: string[];
  toggle: (c: string) => void;
  onHeaderKeyDown: (e: React.KeyboardEvent, col: string) => void;
  clearSelection: () => void;

  numericCols: string[];
  charts: ReturnType<typeof useCharts>;

  expandSplit: boolean;
  setExpandSplit: (v: boolean) => void;
}

const WorkbenchContext = createContext<WorkbenchContextValue | null>(null);

export function WorkbenchProvider({ columns, getPreview, stats, title, onBack, onAction, getSplitPreview, children }: WorkbenchProviderProps) {
  const preview = useMemo(() => getPreview(50), [getPreview]);
  const [selectedCol, setSelectedCol] = useState<string | null>(columns[0] ?? null);
  const { selected: selectedCols, toggle, onHeaderKeyDown, clear: clearSelection } = useDataSelection([]);
  const [expandSplit, setExpandSplit] = useState<boolean>(false);
  const numericCols = useMemo(() => stats.filter(s => s.type === 'numeric').map(s => s.column), [stats]);
  const charts = useCharts(preview, numericCols, selectedCol);

  const value: WorkbenchContextValue = {
    columns,
    stats,
    title,
    onBack,
    onAction,
    getSplitPreview,
    preview,
    selectedCol,
    setSelectedCol,
    selectedCols,
    toggle,
    onHeaderKeyDown,
    clearSelection,
    numericCols,
    charts,
    expandSplit,
    setExpandSplit,
  };

  return (
    <WorkbenchContext.Provider value={value}>{children}</WorkbenchContext.Provider>
  );
}

export function useWorkbench(): WorkbenchContextValue {
  const ctx = useContext(WorkbenchContext);
  if (!ctx) throw new Error("useWorkbench must be used within WorkbenchProvider");
  return ctx;
}


