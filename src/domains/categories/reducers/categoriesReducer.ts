import type { Category } from "../types";

type CategoriesState = {
  categories: Category[];
  loading: boolean;
};

type CategoriesAction =
  | { type: "LOAD_CATEGORIES"; payload: Category[] }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "UPDATE_CATEGORY"; payload: Category }
  | { type: "DELETE_CATEGORY"; payload: string };

export const categoriesInitialState: CategoriesState = {
  categories: [],
  loading: true,
};

export function categoriesReducer(
  state: CategoriesState,
  action: CategoriesAction
): CategoriesState {
  switch (action.type) {
    case "LOAD_CATEGORIES":
      return { ...state, categories: action.payload, loading: false };
    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.payload] };
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
      };
  }
}
