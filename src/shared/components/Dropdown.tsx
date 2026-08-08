"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  className?: string;
  onSelect: () => void;
}

interface DropdownProps {
  /** Render function for the trigger button. Receives isOpen state and click handler. */
  trigger: (props: { isOpen: boolean; onClick: () => void }) => React.ReactNode;
  /** Items to render in the dropdown menu */
  items: DropdownItem[];
  /** Optional custom render function for items */
  renderItem?: (item: DropdownItem, onSelect: (onSelect: () => void) => void) => React.ReactNode;
  /** Disable the dropdown */
  disabled?: boolean;
}

export function Dropdown({ trigger, items, renderItem, disabled = false }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Consolidate click-outside and escape-key handling
  useEffect(() => {
    if (!open) return;

    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSelect = useCallback((onSelect: () => void) => {
    setOpen(false);
    onSelect();
  }, []);

  const handleTriggerClick = useCallback(() => {
    if (!disabled) setOpen((prev) => !prev);
  }, [disabled]);

  return (
    <div ref={containerRef} className="relative">
      {trigger({ isOpen: open, onClick: handleTriggerClick })}

      {open && items.length > 0 && (
        <ul
          role="menu"
          className={clsx(
            "absolute left-0 top-full z-20 mt-1 min-w-[160px] rounded-lg border border-gray-200",
            "bg-white py-1 shadow-lg"
          )}
        >
          {renderItem ? (
            items.map((item) => (
              <li key={item.id} role="none">
                {renderItem(item, handleSelect)}
              </li>
            ))
          ) : (
            items.map((item) => (
              <li key={item.id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(item.onSelect)}
                  className={clsx(
                    "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors",
                    item.className || "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
