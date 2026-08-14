import { render, screen, fireEvent } from "@testing-library/react";
import { BookCard } from "../components/BookCard/BookCard";
import { BookList } from "../components/BookList/BookList";
import { ArchiveDialog } from "../components/ArchiveDialog/ArchiveDialog";
import type { Book } from "../types";
import { Timestamp } from "firebase/firestore";

jest.mock("firebase/firestore", () => ({
  Timestamp: { now: jest.fn() },
  getFirestore: jest.fn(),
}));

const mockBook: Book = {
  id: "book-1",
  name: "My Book",
  description: "A description",
  ownerId: "user-1",
  archived: false,
  participants: ["a", "b"],
  createdAt: { seconds: 0, nanoseconds: 0 } as unknown as Timestamp,
};

describe("BookCard", () => {
  it("renders the book name and participant count", () => {
    render(
      <BookCard book={mockBook} currentUserId="user-1" onEdit={jest.fn()} onArchive={jest.fn()} onRestore={jest.fn()} />
    );
    expect(screen.getByText("My Book")).toBeInTheDocument();
    expect(screen.getByText("2 participants")).toBeInTheDocument();
  });

  it("shows Owner badge for the book owner", () => {
    render(
      <BookCard book={mockBook} currentUserId="user-1" onEdit={jest.fn()} onArchive={jest.fn()} onRestore={jest.fn()} />
    );
    expect(screen.getByText("Owner")).toBeInTheDocument();
  });

  it("shows Participant badge for a non-owner", () => {
    render(
      <BookCard book={mockBook} currentUserId="other-user" onEdit={jest.fn()} onArchive={jest.fn()} onRestore={jest.fn()} />
    );
    expect(screen.getByText("Participant")).toBeInTheDocument();
  });

  it("calls onArchive when Archive is clicked (owner only)", () => {
    const onArchive = jest.fn();
    render(
      <BookCard book={mockBook} currentUserId="user-1" onEdit={jest.fn()} onArchive={onArchive} onRestore={jest.fn()} />
    );
    fireEvent.click(screen.getByText("Archive"));
    expect(onArchive).toHaveBeenCalledWith(mockBook);
  });

  it("does not show owner-only buttons for participants", () => {
    render(
      <BookCard book={mockBook} currentUserId="other-user" onEdit={jest.fn()} onArchive={jest.fn()} onRestore={jest.fn()} />
    );
    expect(screen.queryByText("Archive")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("shows Restore button when book is archived (owner only)", () => {
    const archived = { ...mockBook, archived: true };
    render(
      <BookCard book={archived} currentUserId="user-1" onEdit={jest.fn()} onArchive={jest.fn()} onRestore={jest.fn()} />
    );
    expect(screen.getByText("Restore")).toBeInTheDocument();
  });

  it("does not show Restore to a participant of an archived book", () => {
    const archived = { ...mockBook, archived: true };
    render(
      <BookCard book={archived} currentUserId="other-user" onEdit={jest.fn()} onArchive={jest.fn()} onRestore={jest.fn()} />
    );
    expect(screen.queryByText("Restore")).not.toBeInTheDocument();
  });
});

describe("BookList", () => {
  it("renders empty state when there are no books", () => {
    render(
      <BookList books={[]} currentUserId="user-1" onEdit={jest.fn()} onArchive={jest.fn()} onRestore={jest.fn()} />
    );
    expect(screen.getByText("No books yet")).toBeInTheDocument();
  });

  it("renders a card for each book", () => {
    const books = [mockBook, { ...mockBook, id: "book-2", name: "Second Book" }];
    render(
      <BookList books={books} currentUserId="user-1" onEdit={jest.fn()} onArchive={jest.fn()} onRestore={jest.fn()} />
    );
    expect(screen.getByText("My Book")).toBeInTheDocument();
    expect(screen.getByText("Second Book")).toBeInTheDocument();
  });
});

describe("ArchiveDialog", () => {
  it("renders nothing when book is null", () => {
    const { container } = render(
      <ArchiveDialog book={null} onConfirm={jest.fn()} onCancel={jest.fn()} />
    );
    expect(container.querySelector("dialog[open]")).toBeNull();
  });

  it("calls onConfirm with the book when Archive is clicked", () => {
    const onConfirm = jest.fn();
    render(
      <ArchiveDialog book={mockBook} onConfirm={onConfirm} onCancel={jest.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Archive" }));
    expect(onConfirm).toHaveBeenCalledWith(mockBook);
  });
});
