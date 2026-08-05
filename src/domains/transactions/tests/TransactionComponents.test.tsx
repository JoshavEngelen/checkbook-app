import { render, screen, fireEvent } from "@testing-library/react";
import { TransactionCard } from "../components/TransactionCard/TransactionCard";
import { TransactionList } from "../components/TransactionList/TransactionList";
import { TransactionFilters } from "../components/TransactionFilters/TransactionFilters";
import type { Transaction } from "../types";

const mockTransaction: Transaction = {
  id: "tx-1",
  bookId: "book-1",
  title: "Groceries",
  amount: 50,
  type: "expense",
  date: new Date("2026-08-01"),
};

describe("TransactionCard", () => {
  it("renders title, amount, and date", () => {
    render(<TransactionCard transaction={mockTransaction} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("-$50.00")).toBeInTheDocument();
  });

  it("renders + prefix for income", () => {
    const income = { ...mockTransaction, type: "income" as const, amount: 1000 };
    render(<TransactionCard transaction={income} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText("+$1000.00")).toBeInTheDocument();
  });

  it("calls onEdit when Edit is clicked", () => {
    const onEdit = jest.fn();
    render(<TransactionCard transaction={mockTransaction} onEdit={onEdit} onDelete={jest.fn()} />);
    fireEvent.click(screen.getByText("Edit"));
    expect(onEdit).toHaveBeenCalledWith(mockTransaction);
  });

  it("calls onDelete when Delete is clicked", () => {
    const onDelete = jest.fn();
    render(<TransactionCard transaction={mockTransaction} onEdit={jest.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalledWith(mockTransaction);
  });
});

describe("TransactionList", () => {
  it("renders empty state when there are no transactions", () => {
    render(<TransactionList transactions={[]} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText("No transactions yet")).toBeInTheDocument();
  });

  it("renders a card for each transaction", () => {
    const txs = [mockTransaction, { ...mockTransaction, id: "tx-2", title: "Salary" }];
    render(<TransactionList transactions={txs} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Salary")).toBeInTheDocument();
  });
});

describe("TransactionFilters", () => {
  const filters = {
    month: new Date().toISOString().slice(0, 7),
    type: "all" as const,
  };

  it("renders month and type selects", () => {
    render(<TransactionFilters filters={filters} onChange={jest.fn()} />);
    expect(screen.getByLabelText("Month")).toBeInTheDocument();
    expect(screen.getByLabelText("Type")).toBeInTheDocument();
  });

  it("calls onChange when type changes", () => {
    const onChange = jest.fn();
    render(<TransactionFilters filters={filters} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Type"), { target: { value: "expense" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ type: "expense" }));
  });
});
