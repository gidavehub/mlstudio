"use client";
import { WorkbenchProvider } from "@/components/workbench/WorkbenchContext";
import Header from "@/components/workbench/Header";
import ActionsPanel from "@/components/workbench/ActionsPanel";
import DataGrid from "@/components/workbench/DataGrid";
import ChartsPanel from "@/components/workbench/ChartsPanel";
import SplitViewer from "@/components/workbench/SplitViewer";

interface DataWorkbenchProps {
  columns: string[];
  getPreview: (maxRows?: number) => { columns: string[]; rows: any[][] };
  stats: Array<{ column: string; type: string; count: number; missing: number; unique: number; min?: number; max?: number; mean?: number; std?: number; }>;
  title?: string;
  onBack?: () => void;
  // actions (optional handlers)
  onAction?: (action: { type: string; payload?: any }) => void;
  getSplitPreview?: (maxRows?: number) => { columns: string[]; training: any[][]; validation: any[][]; testing: any[][] };
}

export default function DataWorkbench({ columns, getPreview, stats, title, onBack, onAction, getSplitPreview }: DataWorkbenchProps) {
  return (
    <WorkbenchProvider columns={columns} getPreview={getPreview} stats={stats} title={title} onBack={onBack} onAction={onAction} getSplitPreview={getSplitPreview}>
      <div className="grid grid-rows-[auto_1fr_auto] grid-cols-12 gap-4 h-[calc(100vh-2rem)]">
        <Header />
        <ActionsPanel />
        <DataGrid />
        <ChartsPanel />
        <SplitViewer />
      </div>
    </WorkbenchProvider>
  );
}


