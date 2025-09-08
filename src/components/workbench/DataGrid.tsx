"use client";
import { useWorkbench } from "@/components/workbench/WorkbenchContext";

export default function DataGrid() {
  const { preview, columns, selectedCol, setSelectedCol, selectedCols, toggle, onHeaderKeyDown } = useWorkbench();
  return (
    <div className="col-span-6 bg-ml-dark-100 border border-ml-dark-300 rounded-lg p-4 overflow-auto">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-semibold">Data Preview</h4>
        <div className="flex items-center gap-2">
          <span className="text-ml-dark-400 text-sm">Select column:</span>
          <select value={selectedCol || ""} onChange={(e) => setSelectedCol(e.target.value || null)} className="bg-ml-dark-200 border border-ml-dark-300 text-white text-sm rounded px-2 py-1">
            <option value="">(none)</option>
            {columns.map(c => (
              <option key={`col_${c}`} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-auto border border-ml-dark-300 rounded max-h-[calc(100vh-18rem)]">
        <table className="text-sm min-w-max whitespace-nowrap">
          <thead className="bg-ml-dark-200 sticky top-0">
            <tr>
              {preview.columns.map((c) => (
                <th
                  key={`th_${c}`}
                  onClick={() => { setSelectedCol(c); toggle(c); }}
                  onKeyDown={(e) => onHeaderKeyDown(e as any, c)}
                  tabIndex={0}
                  className={`text-left px-3 py-2 text-ml-dark-400 whitespace-nowrap cursor-pointer ${selectedCols.includes(c) ? 'bg-ml-blue-50/20 text-white' : ''}`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((r, ri) => (
              <tr key={`r_${ri}`} className="border-t border-ml-dark-300">
                {r.map((v: any, ci: number) => {
                  const header = preview.columns[ci];
                  const selected = selectedCols.includes(header);
                  return (
                    <td key={`c_${ri}_${ci}`} className={`px-3 py-2 whitespace-nowrap ${selected ? 'bg-ml-blue-50/10 text-white' : 'text-white'}`}>{String(v)}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


