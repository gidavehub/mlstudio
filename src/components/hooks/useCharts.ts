import { useMemo, useState } from "react";

export function useCharts(preview: { columns: string[]; rows: any[][] }, numericCols: string[], histogramCol?: string | null) {
  const [xCol, setXCol] = useState<string | null>(numericCols[0] ?? null);
  const [yCol, setYCol] = useState<string | null>(numericCols[1] ?? null);

  const histogram = useMemo(() => {
    if (!histogramCol) return [] as any[];
    const ci = preview.columns.indexOf(histogramCol);
    if (ci === -1) return [] as any[];
    const values = preview.rows.map(r => r[ci]).filter(v => typeof v === 'number');
    return values as number[];
  }, [histogramCol, preview]);

  const scatter = useMemo(() => {
    if (!xCol || !yCol) return [] as any[];
    const xi = preview.columns.indexOf(xCol);
    const yi = preview.columns.indexOf(yCol);
    if (xi === -1 || yi === -1) return [] as any[];
    return preview.rows.map(r => ({ x: r[xi], y: r[yi] })).filter(p => typeof p.x === 'number' && typeof p.y === 'number');
  }, [xCol, yCol, preview]);

  return { histogram, scatter, xCol, yCol, setXCol, setYCol };
}


