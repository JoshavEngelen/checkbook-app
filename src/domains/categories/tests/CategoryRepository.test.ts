import { CategoryRepository } from "../data/CategoryRepository";

jest.mock("@/infrastructure/firebase/firestore", () => ({ db: {} }));

const mockCategory = {
  id: "cat-1",
  data: () => ({
    bookId: "book-1",
    name: "Groceries",
    budget: 200,
    endDate: null,
  }),
  exists: () => true,
};

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(() => "categories-collection"),
  getDocs: jest.fn(async () => ({ docs: [mockCategory] })),
  getDoc: jest.fn(async () => mockCategory),
  addDoc: jest.fn(async () => ({ id: "new-cat-id" })),
  updateDoc: jest.fn(async () => undefined),
  deleteDoc: jest.fn(async () => undefined),
  doc: jest.fn((_col, id) => `doc-ref-${id}`),
  query: jest.fn(() => "query-ref"),
  where: jest.fn(() => "where-clause"),
  Timestamp: {
    fromDate: jest.fn((d) => d),
  },
}));

describe("CategoryRepository", () => {
  it("getCategories returns mapped categories", async () => {
    const cats = await CategoryRepository.getCategories("book-1");
    expect(cats).toHaveLength(1);
    expect(cats[0]).toMatchObject({ id: "cat-1", name: "Groceries", budget: 200 });
  });

  it("getCategoryById returns a category when it exists", async () => {
    const cat = await CategoryRepository.getCategoryById("cat-1");
    expect(cat).toMatchObject({ id: "cat-1", name: "Groceries" });
  });

  it("createCategory returns the created category with an id", async () => {
    const cat = await CategoryRepository.createCategory("book-1", {
      name: "Transport",
      budget: 100,
    });
    expect(cat.id).toBe("new-cat-id");
    expect(cat.name).toBe("Transport");
    expect(cat.bookId).toBe("book-1");
  });

  it("deleteCategory calls deleteDoc with the correct ref", async () => {
    const { deleteDoc } = jest.requireMock("firebase/firestore");
    await CategoryRepository.deleteCategory("cat-1");
    expect(deleteDoc).toHaveBeenCalledWith("doc-ref-cat-1");
  });

  it("updateCategory calls updateDoc", async () => {
    const { updateDoc } = jest.requireMock("firebase/firestore");
    await CategoryRepository.updateCategory("cat-1", { name: "Updated" });
    expect(updateDoc).toHaveBeenCalledWith("doc-ref-cat-1", expect.objectContaining({ name: "Updated" }));
  });
});
