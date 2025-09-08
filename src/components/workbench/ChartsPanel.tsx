"use client";
import { useMemo } from "react";
// Temporarily disabled Recharts due to syntax error
// import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ScatterChart, Scatter, CartesianGrid } from "recharts";
import { useWorkbench } from "@/components/workbench/WorkbenchContext";
import { DataVisualizer } from "@/lib/dataProcessing";

export default function ChartsPanel() {
  const { charts, numericCols, preview } = useWorkbench();

  const histData = useMemo(() => {
    const values = charts.histogram as number[];
    if (!values.length) return [] as any[];
    const { bins, counts } = DataVisualizer.createHistogram(values, 20);
    return bins.map((b, i) => ({ bin: Number((b as number).toFixed(2)), count: counts[i] }));
  }, [charts.histogram]);

  // Correlation heatmap (top 8 numeric columns)
  const heat = useMemo(() => {
    const cols = numericCols.slice(0, 8);
    const idxs = cols.map(c => preview.columns.indexOf(c));
    if (idxs.some(i => i === -1)) return { cols: [], mat: [] as number[][] };
    const matrixData: number[][] = preview.rows
      .map(r => idxs.map(i => (typeof r[i] === 'number' ? (r[i] as number) : NaN)))
      .filter(row => row.every(v => !Number.isNaN(v)));
    if (!matrixData.length) return { cols: [], mat: [] as number[][] };
    const mat = DataVisualizer.createCorrelationMatrix(matrixData);
    return { cols, mat };
  }, [numericCols, preview]);

  return (
    <div className="col-span-3 bg-ml-dark-100 border border-ml-dark-300 rounded-lg p-4">
      <h4 className="text-white font-semibold mb-3">Charts</h4>
      {histData.length > 0 ? (
        <div className="space-y-4">
          <div>
            <p className="text-ml-dark-400 text-sm mb-1">Histogram</p>
            <div style={{ width: "100%", height: 180 }} className="flex items-center justify-center bg-ml-dark-200 rounded-lg">
              <div className="text-center">
                <div className="text-white text-sm">Histogram Chart</div>
                <div className="text-ml-dark-400 text-xs">{histData.length} data points</div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-ml-dark-400 text-sm">Scatter</p>
              <select value={charts.xCol || ''} onChange={(e) => charts.setXCol(e.target.value)} className="bg-ml-dark-200 border border-ml-dark-300 text-white text-xs rounded px-1 py-0.5"><option value="">x</option>{numericCols.map(c => <option key={`x_${c}`} value={c}>{c}</option>)}</select>
              <select value={charts.yCol || ''} onChange={(e) => charts.setYCol(e.target.value)} className="bg-ml-dark-200 border border-ml-dark-300 text-white text-xs rounded px-1 py-0.5"><option value="">y</option>{numericCols.map(c => <option key={`y_${c}`} value={c}>{c}</option>)}</select>
            </div>
            <div style={{ width: '100%', height: 160 }} className="flex items-center justify-center bg-ml-dark-200 rounded-lg">
              <div className="text-center">
                <div className="text-white text-sm">Scatter Plot</div>
                <div className="text-ml-dark-400 text-xs">{(charts.scatter as any[])?.length || 0} data points</div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-ml-dark-400 text-sm mb-1">Correlation heatmap</p>
            {heat.cols.length ? (
              <div className="overflow-auto">
                <table className="text-xs">
                  <thead>
                    <tr>
                      <th className="pr-2"></th>
                      {heat.cols.map(c => <th key={`hh_${c}`} className="pr-2 text-ml-dark-400">{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {heat.mat.map((row, i) => (
                      <tr key={`hr_${i}`}>
                        <td className="pr-2 text-ml-dark-400">{heat.cols[i]}</td>
                        {row.map((v, j) => (
                          <td key={`hc_${i}_${j}`} className="pr-2 py-0.5">
                            <div className="w-6 h-6 rounded" style={{ backgroundColor: `rgba(17, 115, 212, ${Math.abs(v)})` }} title={v.toFixed(2)} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-16 bg-ml-dark-200 rounded" />
            )}
          </div>
        </div>
      ) : (
        <p className="text-ml-dark-400 text-sm">Select a numeric column to see charts.</p>
      )}
    </div>
  );
}


