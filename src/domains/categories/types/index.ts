export type Category = {
  id: string;
  bookId: string;
  name: string;
  budget: number;
  endDate?: Date;
};

export type CreateCategoryRequest = Pick<Category, "name" | "budget" | "endDate">;

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

// Lightweight projection for list views
export type CategorySummary = Pick<Category, "id" | "name" | "budget" | "endDate">;
