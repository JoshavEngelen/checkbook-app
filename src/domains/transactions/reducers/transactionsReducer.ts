import type { Transaction } from "../types";

type TransactionsState = {
  transactions: Transaction[];
  loading: boolean;
};

type TransactionsAction =
  | { type: "LOAD_TRANSACTIONS"; payload: Transaction[] }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "UPDATE_TRANSACTION"; payload: Transaction }
  | { type: "DELETE_TRANSACTION"; payload: string };

export const transactionsInitialState: TransactionsState = {
  transactions: [],
  loading: true,
};

export function transactionsReducer(
  state: TransactionsState,
  action: TransactionsAction
): TransactionsState {
  switch (action.type) {
    case "LOAD_TRANSACTIONS":
      return { ...state, transactions: action.payload, loading: false };
    case "ADD_TRANSACTION":
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
  }
}
