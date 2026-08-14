import { render, screen, act } from "@testing-library/react";
import { BookAccessGuard } from "../_components/BookAccessGuard";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("@/domains/books", () => ({ useBook: jest.fn() }));

const { useBook } = jest.requireMock("@/domains/books") as { useBook: jest.Mock };

function setup(opts: { loading: boolean; forbidden: boolean }) {
  useBook.mockReturnValue({
    book: opts.forbidden ? null : { id: "book-1", name: "Test" },
    loading: opts.loading,
    forbidden: opts.forbidden,
    error: null,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BookAccessGuard", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows a spinner while the book is loading", () => {
    setup({ loading: true, forbidden: false });
    render(
      <BookAccessGuard bookId="book-1">
        <p>Protected content</p>
      </BookAccessGuard>
    );
    // Children must not appear while loading
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders children when the book has loaded and access is granted", async () => {
    setup({ loading: false, forbidden: false });
    render(
      <BookAccessGuard bookId="book-1">
        <p>Protected content</p>
      </BookAccessGuard>
    );
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("redirects to /books?error=forbidden when forbidden", async () => {
    setup({ loading: false, forbidden: true });
    await act(async () => {
      render(
        <BookAccessGuard bookId="bad-book">
          <p>Protected content</p>
        </BookAccessGuard>
      );
    });
    expect(mockReplace).toHaveBeenCalledWith("/books?error=forbidden");
  });

  it("does not render children when forbidden (prevents content flash)", async () => {
    setup({ loading: false, forbidden: true });
    await act(async () => {
      render(
        <BookAccessGuard bookId="bad-book">
          <p>Protected content</p>
        </BookAccessGuard>
      );
    });
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("does not redirect while still loading", () => {
    setup({ loading: true, forbidden: false });
    render(
      <BookAccessGuard bookId="book-1">
        <p>Protected content</p>
      </BookAccessGuard>
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
