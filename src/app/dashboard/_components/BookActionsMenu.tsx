"use client";

import clsx from "clsx";
import type { Book } from "@/domains/books";
import { Dropdown, type DropdownItem } from "@/shared/components";

interface BookActionsMenuProps {
  /** The currently selected book. When null the menu trigger is disabled. */
  book: Book | null;
  /** When false the menu is not rendered — used for participant users. */
  isOwner: boolean;
  onEdit: (book: Book) => void;
  onArchive: (book: Book) => void;
}

const EDIT_ICON = (
  <svg
    aria-hidden="true"
    className="h-4 w-4 shrink-0 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const ARCHIVE_ICON = (
  <svg
    aria-hidden="true"
    className="h-4 w-4 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8"
    />
  </svg>
);

export function BookActionsMenu({ book, isOwner, onEdit, onArchive }: BookActionsMenuProps) {
  if (!isOwner) return null;
  const items: DropdownItem[] = [
    {
      id: "edit",
      label: "Edit book",
      icon: EDIT_ICON,
      className: "text-gray-700 hover:bg-gray-50",
      onSelect: () => book && onEdit(book),
    },
    {
      id: "archive",
      label: "Archive book",
      icon: ARCHIVE_ICON,
      className: "text-red-600 hover:bg-red-50",
      onSelect: () => book && onArchive(book),
    },
  ];

  return (
    <Dropdown
      disabled={book === null}
      items={items}
      trigger={({ isOpen, onClick }) => (
        <button
          type="button"
          disabled={book === null}
          onClick={onClick}
          aria-label="Book actions"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className={clsx(
            "inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
            book === null
              ? "cursor-not-allowed text-gray-300"
              : isOpen
              ? "bg-blue-50 text-blue-600"
              : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          )}
        >
          {/* Horizontal ellipsis ⋯ */}
          <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="4" cy="10" r="1.5" />
            <circle cx="10" cy="10" r="1.5" />
            <circle cx="16" cy="10" r="1.5" />
          </svg>
        </button>
      )}
    />
  );
}
