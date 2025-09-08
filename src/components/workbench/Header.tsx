"use client";
import { useWorkbench } from "@/components/workbench/WorkbenchContext";

export default function Header() {
  const { title, onBack, columns, preview, stats } = useWorkbench();
  return (
    <div className="col-span-12 bg-ml-dark-100 border border-ml-dark-300 rounded-lg p-3">
      <div className="flex flex-wrap items-center gap-4">
        <button onClick={onBack} className="px-3 py-1 text-ml-dark-400 hover:text-white hover:bg-ml-dark-200 rounded">Back</button>
        {title && (
          <span className="text-white font-semibold truncate max-w-[40%]">{title}</span>
        )}
        <div className="ml-auto flex items-center gap-6">
          <div>
            <p className="text-ml-dark-400 text-xs">Columns</p>
            <p className="text-white text-lg font-semibold text-center">{columns.length}</p>
          </div>
          <div>
            <p className="text-ml-dark-400 text-xs">Rows (preview)</p>
            <p className="text-white text-lg font-semibold text-center">{preview.rows.length}</p>
          </div>
          <div>
            <p className="text-ml-dark-400 text-xs">Missing (%)</p>
            <p className="text-white text-lg font-semibold text-center">
              {stats.length ? (
                (100 * (stats.reduce((s, c) => s + c.missing, 0) / (stats.reduce((s, c) => s + (c.count + c.missing), 0) || 1))).toFixed(1)
              ) : "0.0"}%
            </p>
          </div>
          <div className="min-w-[240px]">
            <input className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded px-3 py-2 text-sm text-white" placeholder="Search columns, stats, actions..." />
          </div>
        </div>
      </div>
    </div>
  );
}


