import { Download } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function ImportPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 sm:py-8">
      <section
        className="max-w-5xl"
        aria-labelledby="import-results-heading"
      >
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h2 id="import-results-heading" className="text-base font-bold">
              Import results
            </h2>
            <p className="text-sm text-admin-muted-strong">
              External matches returned from the admin search bar.
            </p>
          </div>
          {/* API value: pending external match count */}
        </div>

        <div className="space-y-3">
          {/* API response: map external results to import cards and set the selected import record */}
          <Card className="rounded-lg border-admin-line border-dashed bg-admin-surface/70 py-10 text-center shadow-none">
            <CardContent className="flex flex-col items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-admin-line-soft text-admin-espresso">
                <Download />
              </span>
              <div>
                <p className="font-semibold">Import results will appear here</p>
                <p className="mt-1 text-sm text-admin-muted">
                  Use the search bar in the admin toolbar to find external
                  records.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* state: selectedResult and importSheetOpen control ImportTitleSheet */}
        {/* handlers: result selection and import actions connect here without toast logic */}
      </section>
    </main>
  );
}
