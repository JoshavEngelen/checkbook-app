import { render, screen, fireEvent } from "@testing-library/react";
import { DashboardStats } from "../_components/DashboardStats";
import type { MonthlyStats } from "@/domains/transactions/operations/calculateMonthlyStats";

const stats: MonthlyStats = {
  totalIncome: 2000,
  totalExpenses: 750,
  balance: 1250,
  transactionCount: 5,
};

const zeroStats: MonthlyStats = {
  totalIncome: 0,
  totalExpenses: 0,
  balance: 0,
  transactionCount: 0,
};

describe("DashboardStats", () => {
  it("renders total income with + prefix", () => {
    render(<DashboardStats stats={stats} month="2026-08" onMonthChange={jest.fn()} />);
    expect(screen.getByText("+$2000.00")).toBeInTheDocument();
  });

  it("renders total expenses with - prefix", () => {
    render(<DashboardStats stats={stats} month="2026-08" onMonthChange={jest.fn()} />);
    expect(screen.getByText("-$750.00")).toBeInTheDocument();
  });

  it("renders positive balance with + prefix", () => {
    render(<DashboardStats stats={stats} month="2026-08" onMonthChange={jest.fn()} />);
    expect(screen.getByText("+$1250.00")).toBeInTheDocument();
  });

  it("renders negative balance with − prefix (not just colour)", () => {
    const deficit: MonthlyStats = { ...stats, balance: -300 };
    render(<DashboardStats stats={deficit} month="2026-08" onMonthChange={jest.fn()} />);
    expect(screen.getByText("−$300.00")).toBeInTheDocument();
  });

  it("renders transaction count", () => {
    render(<DashboardStats stats={stats} month="2026-08" onMonthChange={jest.fn()} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders zero stats without crashing", () => {
    render(<DashboardStats stats={zeroStats} month="2026-08" onMonthChange={jest.fn()} />);
    // Income label +$0.00 and Balance +$0.00 share the same text — use getAllByText
    const plusZero = screen.getAllByText("+$0.00");
    expect(plusZero.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("0")).toBeInTheDocument(); // transaction count
  });

  it("renders loading skeletons when loading is true", () => {
    const { container } = render(
      <DashboardStats stats={zeroStats} month="2026-08" onMonthChange={jest.fn()} loading />
    );
    // Skeleton elements have animate-pulse class
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
    // Dollar amounts should not appear while loading
    expect(screen.queryByText("+$0.00")).not.toBeInTheDocument();
  });

  it("calls onMonthChange when the month selector changes", () => {
    const onMonthChange = jest.fn();
    render(
      <DashboardStats stats={stats} month="2026-08" onMonthChange={onMonthChange} />
    );
    const select = screen.getByLabelText("Month");
    fireEvent.change(select, { target: { value: "2026-07" } });
    expect(onMonthChange).toHaveBeenCalledWith("2026-07");
  });

  it("has an accessible section heading", () => {
    render(<DashboardStats stats={stats} month="2026-08" onMonthChange={jest.fn()} />);
    expect(
      screen.getByRole("region", { name: "Financial overview" })
    ).toBeInTheDocument();
  });
});
