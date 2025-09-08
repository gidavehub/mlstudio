"use client";
import { useWorkbench } from "@/components/workbench/WorkbenchContext";

export default function ActionsPanel() {
  const { selectedCols, onAction, setExpandSplit } = useWorkbench();
  return (
    <div className="row-span-2 col-span-3 bg-ml-dark-100 border border-ml-dark-300 rounded-lg p-4 overflow-y-auto">
      <h4 className="text-white font-semibold mb-3">Actions</h4>
      <div className="space-y-4 text-sm">
        <div>
          <p className="text-ml-dark-400 mb-2">Missing Values</p>
          <div className="flex flex-wrap gap-2">
            {['drop','mean','median','mode'].map(k => (
              <button onClick={() => onAction?.({ type: 'missing', payload: { strategy: k, targetColumns: selectedCols } })} key={`mv_${k}`} className="px-2 py-1 bg-ml-dark-200 text-white rounded cursor-pointer select-none hover:bg-ml-dark-300">{k}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-ml-dark-400 mb-2">Scaling</p>
          <div className="flex flex-wrap gap-2">
            {['minmax','zscore','robust'].map(k => (
              <button onClick={() => onAction?.({ type: 'normalize', payload: { method: k, targetColumns: selectedCols } })} key={`sc_${k}`} className="px-2 py-1 bg-ml-dark-200 text-white rounded cursor-pointer select-none hover:bg-ml-dark-300">{k}</button>
            ))}
          </div>
          <div className="mt-3">
            <p className="text-ml-dark-400 mb-1">Intensity</p>
            <input type="range" min={0} max={100} defaultValue={100} className="w-full" />
          </div>
        </div>
        <div>
          <p className="text-ml-dark-400 mb-2">Encoding</p>
          <div className="flex flex-wrap gap-2">
            {['onehot','label','target'].map(k => (
              <button onClick={() => onAction?.({ type: 'encode', payload: { method: k, targetColumns: selectedCols } })} key={`enc_${k}`} className="px-2 py-1 bg-ml-dark-200 text-white rounded cursor-pointer select-none hover:bg-ml-dark-300">{k}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-ml-dark-400 mb-2">Clip Outliers</p>
          <div className="flex items-center gap-2">
            <button onClick={() => onAction?.({ type: 'clip', payload: { method: 'iqr', targetColumns: selectedCols } })} className="px-2 py-1 bg-ml-dark-200 text-white rounded cursor-pointer select-none hover:bg-ml-dark-300">IQR</button>
            <button onClick={() => onAction?.({ type: 'clip', payload: { method: 'percentile', lowerPercentile: 1, upperPercentile: 99, targetColumns: selectedCols } })} className="px-2 py-1 bg-ml-dark-200 text-white rounded cursor-pointer select-none hover:bg-ml-dark-300">Percentile 1–99</button>
          </div>
        </div>
        <div>
          <p className="text-ml-dark-400 mb-2">Split</p>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" defaultValue={70} className="split-input px-2 py-1 bg-ml-dark-200 text-white rounded" />
            <input type="number" defaultValue={15} className="split-input px-2 py-1 bg-ml-dark-200 text-white rounded" />
            <input type="number" defaultValue={15} className="split-input px-2 py-1 bg-ml-dark-200 text-white rounded" />
          </div>
          <button onClick={() => { setExpandSplit(true); onAction?.({ type: 'split', payload: null }); }} className="mt-3 px-3 py-2 bg-ml-dark-200 text-white rounded hover:bg-ml-dark-300">Apply Split</button>
        </div>
      </div>
    </div>
  );
}


