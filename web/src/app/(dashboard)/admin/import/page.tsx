import { ImportPage } from "@/features/import/components/import-page";
import { getSearchCategories } from "@/features/import/services/getSearchCategories";

export default async function AdminImportPage() {
  let categories: string[] = [];
  let categoriesError: string | undefined;

  try {
    categories = await getSearchCategories();
  } catch {
    categoriesError = "Could not load search categories. Reload the page to try again.";
  }

  return <ImportPage categories={categories} categoriesError={categoriesError} />;
}
