import { categoriesReducer, categoriesInitialState } from "../reducers/categoriesReducer";
import type { Category } from "../types";

const makeCategory = (overrides?: Partial<Category>): Category => ({
  id: "cat-1",
  bookId: "book-1",
  name: "Groceries",
  budget: 200,
  ...overrides,
});

describe("categoriesReducer", () => {
  it("LOAD_CATEGORIES replaces list and clears loading", () => {
    const categories = [makeCategory()];
    const state = categoriesReducer(categoriesInitialState, {
      type: "LOAD_CATEGORIES",
      payload: categories,
    });
    expect(state.categories).toEqual(categories);
    expect(state.loading).toBe(false);
  });

  it("ADD_CATEGORY appends a category", () => {
    const existing = makeCategory({ id: "cat-1" });
    const added = makeCategory({ id: "cat-2", name: "Transport" });
    const initial = { ...categoriesInitialState, categories: [existing] };
    const state = categoriesReducer(initial, { type: "ADD_CATEGORY", payload: added });
    expect(state.categories).toHaveLength(2);
    expect(state.categories[1]).toEqual(added);
  });

  it("UPDATE_CATEGORY replaces the matching category", () => {
    const category = makeCategory({ name: "Old" });
    const updated = { ...category, name: "Updated", budget: 300 };
    const initial = { ...categoriesInitialState, categories: [category] };
    const state = categoriesReducer(initial, { type: "UPDATE_CATEGORY", payload: updated });
    expect(state.categories[0].name).toBe("Updated");
    expect(state.categories[0].budget).toBe(300);
  });

  it("DELETE_CATEGORY removes the category by id", () => {
    const target = makeCategory({ id: "cat-1" });
    const other = makeCategory({ id: "cat-2" });
    const initial = { ...categoriesInitialState, categories: [target, other] };
    const state = categoriesReducer(initial, { type: "DELETE_CATEGORY", payload: "cat-1" });
    expect(state.categories).toHaveLength(1);
    expect(state.categories[0].id).toBe("cat-2");
  });

  it("does not mutate unrelated categories", () => {
    const target = makeCategory({ id: "cat-1", name: "Old" });
    const other = makeCategory({ id: "cat-2", name: "Other" });
    const initial = { ...categoriesInitialState, categories: [target, other] };
    const updated = { ...target, name: "Updated" };
    const state = categoriesReducer(initial, { type: "UPDATE_CATEGORY", payload: updated });
    expect(state.categories[1].name).toBe("Other");
  });
});
