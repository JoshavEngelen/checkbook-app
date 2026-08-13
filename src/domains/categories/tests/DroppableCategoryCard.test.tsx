import { render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { DroppableCategoryCard } from "../components/DroppableCategoryCard/DroppableCategoryCard";
import type { Category } from "../types";

const cat: Category = {
  id: "cat-1",
  bookId: "book-1",
  name: "Food",
  budget: 200,
};

function renderInContext(ui: React.ReactElement) {
  return render(<DndContext>{ui}</DndContext>);
}

describe("DroppableCategoryCard", () => {
  it("renders the category name and budget", () => {
    renderInContext(
      <DroppableCategoryCard category={cat} spent={50} onEdit={jest.fn()} />
    );
    expect(screen.getByText("Food")).toBeInTheDocument();
    // CategoryBudget shows "Budget: $200.00"
    expect(screen.getByText("Budget: $200.00")).toBeInTheDocument();
  });

  it("has an aria-label identifying it as a drop zone", () => {
    renderInContext(
      <DroppableCategoryCard category={cat} spent={0} onEdit={jest.fn()} />
    );
    expect(screen.getByLabelText("Drop zone: Food")).toBeInTheDocument();
  });

  it("calls onEdit when the category name button is clicked", () => {
    const onEdit = jest.fn();
    renderInContext(
      <DroppableCategoryCard category={cat} spent={0} onEdit={onEdit} />
    );
    screen.getByText("Food").click();
    expect(onEdit).toHaveBeenCalledWith(cat);
  });

  it("shows the end date when provided", () => {
    const catWithEnd: Category = { ...cat, endDate: new Date("2026-12-31") };
    renderInContext(
      <DroppableCategoryCard category={catWithEnd} spent={0} onEdit={jest.fn()} />
    );
    expect(screen.getByText(/until/)).toBeInTheDocument();
  });

  it("does not show 'Drop to assign' when nothing is being dragged", () => {
    renderInContext(
      <DroppableCategoryCard category={cat} spent={0} onEdit={jest.fn()} />
    );
    expect(screen.queryByText("Drop to assign")).not.toBeInTheDocument();
  });
});
