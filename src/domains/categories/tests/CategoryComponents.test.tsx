import { render, screen, fireEvent } from "@testing-library/react";
import { CategoryCard } from "../components/CategoryCard/CategoryCard";
import { CategoryList } from "../components/CategoryList/CategoryList";
import { CategoryBudget } from "../components/CategoryBudget/CategoryBudget";
import type { Category } from "../types";

const mockCategory: Category = {
  id: "cat-1",
  bookId: "book-1",
  name: "Groceries",
  budget: 200,
};

describe("CategoryCard", () => {
  it("renders the category name and budget", () => {
    render(<CategoryCard category={mockCategory} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("$200.00")).toBeInTheDocument();
  });

  it("calls onEdit when Edit is clicked", () => {
    const onEdit = jest.fn();
    render(<CategoryCard category={mockCategory} onEdit={onEdit} onDelete={jest.fn()} />);
    fireEvent.click(screen.getByText("Edit"));
    expect(onEdit).toHaveBeenCalledWith(mockCategory);
  });

  it("calls onDelete when Delete is clicked", () => {
    const onDelete = jest.fn();
    render(<CategoryCard category={mockCategory} onEdit={jest.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalledWith(mockCategory);
  });

  it("renders end date when present", () => {
    const cat = { ...mockCategory, endDate: new Date("2026-12-31") };
    render(<CategoryCard category={cat} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText(/31\/12\/2026/)).toBeInTheDocument();
  });
});

describe("CategoryList", () => {
  it("renders empty state when there are no categories", () => {
    render(<CategoryList categories={[]} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText("No categories yet")).toBeInTheDocument();
  });

  it("renders a card for each category", () => {
    const categories = [mockCategory, { ...mockCategory, id: "cat-2", name: "Transport" }];
    render(<CategoryList categories={categories} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Transport")).toBeInTheDocument();
  });
});

describe("CategoryBudget", () => {
  it("renders budget and remaining amount", () => {
    render(<CategoryBudget budget={200} spent={50} />);
    expect(screen.getByText("Spent: $50.00")).toBeInTheDocument();
    expect(screen.getByText("$150.00 left")).toBeInTheDocument();
    expect(screen.getByText("Budget: $200.00")).toBeInTheDocument();
  });

  it("shows over-budget state when spent exceeds budget", () => {
    render(<CategoryBudget budget={100} spent={150} />);
    expect(screen.getByText(/Over by \$50\.00/)).toBeInTheDocument();
  });

  it("renders a progressbar", () => {
    render(<CategoryBudget budget={200} spent={100} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
