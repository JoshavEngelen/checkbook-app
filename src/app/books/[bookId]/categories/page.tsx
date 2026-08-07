import { CategoriesContent } from "../_components/CategoriesContent";

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  return <CategoriesContent bookId={bookId} />;
}
