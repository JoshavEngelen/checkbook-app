import { TransactionsContent } from "../_components/TransactionsContent";

export default async function TransactionsPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  return <TransactionsContent bookId={bookId} />;
}
