import { renderHook, act, waitFor } from "@testing-library/react";
import { useCategories } from "../hooks/useCategories";
import { CategoryRepository } from "../data/CategoryRepository";
import type { Category } from "../types";

jest.mock("../data/CategoryRepository");

const mockCategory: Category = {
  id: "cat-1",
  bookId: "book-1",
  name: "Groceries",
  budget: 200,
};

beforeEach(() => {
  jest.mocked(CategoryRepository.getCategories).mockResolvedValue([mockCategory]);
  jest.mocked(CategoryRepository.createCategory).mockResolvedValue({
    ...mockCategory,
    id: "cat-2",
    name: "Transport",
  });
  jest.mocked(CategoryRepository.updateCategory).mockResolvedValue(undefined);
  jest.mocked(CategoryRepository.deleteCategory).mockResolvedValue(undefined);
});

describe("useCategories", () => {
  it("loads categories on mount", async () => {
    const { result } = renderHook(() => useCategories("book-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.categories).toHaveLength(1);
    expect(result.current.categories[0].name).toBe("Groceries");
  });

  it("createCategory appends the new category", async () => {
    const { result } = renderHook(() => useCategories("book-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.createCategory({ name: "Transport", budget: 50 });
    });
    expect(result.current.categories).toHaveLength(2);
    expect(result.current.categories[1].name).toBe("Transport");
  });

  it("deleteCategory removes the category from state", async () => {
    const { result } = renderHook(() => useCategories("book-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.deleteCategory("cat-1");
    });
    expect(result.current.categories).toHaveLength(0);
  });

  it("updateCategory patches the category in state", async () => {
    const { result } = renderHook(() => useCategories("book-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.updateCategory("cat-1", { budget: 999 });
    });
    expect(result.current.categories[0].budget).toBe(999);
  });
});
