"use client";
import { useWorkbench } from "@/components/workbench/WorkbenchContext";

export default function SplitViewer() {
  const { getSplitPreview, expandSplit } = useWorkbench();
  return (
    <div className={`col-span-12 bg-ml-dark-100 border border-ml-dark-300 rounded-lg p-4 overflow-auto ${expandSplit ? 'max-h-[60vh]' : 'max-h-[24vh]'}`}>
      <h4 className="text-white font-semibold mb-2">Split Viewer</h4>
      {getSplitPreview ? (
        (() => {
          const sp = getSplitPreview(10);
          return (
            <div className="grid grid-cols-3 gap-3">
              {['training','validation','testing'].map((k) => (
                <div key={`sv_${k}`} className="bg-ml-dark-200 rounded p-2 overflow-auto">
                  <p className="text-ml-dark-400 text-sm mb-2 capitalize">{k}</p>
                  <table className="text-xs min-w-max whitespace-nowrap">
                    <thead>
                      <tr>
                        {sp.columns.map(c => (<th key={`svh_${k}_${c}`} className="text-left pr-2 pb-1 text-ml-dark-400">{c}</th>))}
                      </tr>
                    </thead>
                    <tbody>
                      {(sp as any)[k].map((r: any[], ri: number) => (
                        <tr key={`svr_${k}_${ri}`} className="border-t border-ml-dark-300">
                          {r.map((v: any, ci: number) => (<td key={`svc_${k}_${ri}_${ci}`} className="pr-2 py-1 text-white">{String(v)}</td>))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          );
        })()
      ) : (
        <p className="text-ml-dark-400 text-sm">After splitting, preview train/validation/test groups here.</p>
      )}
    </div>
  );
}


