import { ImportPage } from "@/features/import/components/import-page";
import { getSearchProviders } from "@/features/import/services/getSearchProviders";

export default async function AdminImportPage() {
  let providers: string[] = [];
  let providersError: string | undefined;

  try {
    providers = await getSearchProviders();
  } catch {
    providersError = "Could not load search providers. Reload the page to try again.";
  }

  return <ImportPage providers={providers} providersError={providersError} />;
}
