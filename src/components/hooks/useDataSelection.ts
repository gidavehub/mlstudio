import { useCallback, useState } from "react";

export function useDataSelection(initial: string[] = []) {
  const [selected, setSelected] = useState<string[]>(initial);

  const isSelected = useCallback((col: string) => selected.includes(col), [selected]);

  const toggle = useCallback((col: string) => {
    setSelected((prev) => (prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]));
  }, []);

  const replace = useCallback((cols: string[]) => setSelected(cols), []);
  const clear = useCallback(() => setSelected([]), []);

  // Keyboard: Space/Enter toggles; Ctrl/Meta allows multi-select, otherwise single-select
  const onHeaderKeyDown = useCallback(
    (e: React.KeyboardEvent, col: string) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
          toggle(col);
        } else {
          setSelected((prev) => (prev.length === 1 && prev[0] === col ? [] : [col]));
        }
      }
    },
    [toggle]
  );

  return { selected, isSelected, toggle, replace, clear, onHeaderKeyDown };
}


