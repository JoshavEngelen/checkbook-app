import { TransactionsContent } from "../_components/TransactionsContent";

export default async function TransactionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookId: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { bookId } = await params;
  const { category } = await searchParams;
  return <TransactionsContent bookId={bookId} initialCategoryId={category} />;
}
