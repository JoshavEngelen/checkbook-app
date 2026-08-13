import { render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { DraggableTransactionCard } from "../components/DraggableTransactionCard/DraggableTransactionCard";
import { TransactionCard } from "../components/TransactionCard/TransactionCard";
import type { Transaction } from "../types";

const tx: Transaction = {
  id: "tx-1",
  bookId: "book-1",
  title: "Coffee",
  amount: 4.5,
  type: "expense",
  date: new Date("2026-08-01"),
};

function renderInContext(ui: React.ReactElement) {
  return render(<DndContext>{ui}</DndContext>);
}

describe("DraggableTransactionCard", () => {
  it("renders the transaction title and amount", () => {
    renderInContext(
      <DraggableTransactionCard transaction={tx} onEdit={jest.fn()} onDelete={jest.fn()} />
    );
    expect(screen.getByText("Coffee")).toBeInTheDocument();
    expect(screen.getByText("-$4.50")).toBeInTheDocument();
  });

  it("has aria-roledescription indicating it is draggable", () => {
    const { container } = renderInContext(
      <DraggableTransactionCard transaction={tx} onEdit={jest.fn()} onDelete={jest.fn()} />
    );
    const draggable = container.querySelector("[aria-roledescription='draggable transaction']");
    expect(draggable).toBeInTheDocument();
  });

  it("calls onEdit when Edit is clicked", () => {
    const onEdit = jest.fn();
    renderInContext(
      <DraggableTransactionCard transaction={tx} onEdit={onEdit} onDelete={jest.fn()} />
    );
    screen.getByText("Edit").click();
    expect(onEdit).toHaveBeenCalledWith(tx);
  });

  it("calls onDelete when Delete is clicked", () => {
    const onDelete = jest.fn();
    renderInContext(
      <DraggableTransactionCard transaction={tx} onEdit={jest.fn()} onDelete={onDelete} />
    );
    screen.getByText("Delete").click();
    expect(onDelete).toHaveBeenCalledWith(tx);
  });
});

describe("TransactionCard (unchanged baseline)", () => {
  it("still renders correctly outside DndContext", () => {
    render(<TransactionCard transaction={tx} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText("Coffee")).toBeInTheDocument();
  });
});
