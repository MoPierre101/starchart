import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"

type ImportTitleSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportTitleSheet({ open, onOpenChange }: ImportTitleSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="admin-theme w-full bg-admin-surface sm:max-w-md">
        <SheetHeader className="border-b border-admin-line px-6 py-5">
          <SheetTitle>Import title</SheetTitle>
          <SheetDescription>{/* API value: selected external record summary */}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 pb-6">
          <section>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-admin-muted">Subcategory</label>
            {/* API response: populate subcategory options and bind selectedSubcategory state */}
            <Select>
              <SelectTrigger className="w-full"><SelectValue placeholder="Choose a subcategory" /></SelectTrigger>
              <SelectContent><SelectItem value="connect-api" disabled>Connect API to load options</SelectItem></SelectContent>
            </Select>
          </section>

          <section>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-admin-muted">Era</label>
            {/* API response: populate eras for the selected subcategory and bind selectedEra state */}
            <Select>
              <SelectTrigger className="w-full"><SelectValue placeholder="Choose an era" /></SelectTrigger>
              <SelectContent><SelectItem value="select-subcategory" disabled>Select a subcategory first</SelectItem></SelectContent>
            </Select>
          </section>

          <section>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-admin-muted">Canon status</label>
            <Select>
              <SelectTrigger className="w-full"><SelectValue placeholder="Choose canon status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="canon">Canon</SelectItem>
                <SelectItem value="elseworlds">Elseworlds</SelectItem>
              </SelectContent>
            </Select>
            {/* state: canon status replaces the wireframe selection state */}
          </section>

          <section>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-admin-muted">Publish status</label>
            <Select>
              <SelectTrigger className="w-full"><SelectValue placeholder="Choose publish status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
            {/* state: publish status replaces the wireframe selection state */}
          </section>

          <section className="flex items-start justify-between gap-4 rounded-lg border border-admin-line bg-admin-cream p-4">
            <div>
              <h3 className="font-semibold">Auto-fetch child records</h3>
              <p className="text-sm text-admin-muted-strong">Fetch available issues or episodes from the selected provider.</p>
            </div>
            <Switch aria-label="Auto-fetch child records" />
            {/* state: auto-fetch preference replaces the wireframe toggle state */}
          </section>
        </div>

        <SheetFooter className="border-t border-admin-line px-6 py-4 sm:flex-row">
          <Button variant="outline">Cancel</Button>
          <Button>Import and place</Button>
          {/* handler: connect the import mutation here without alert logic */}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
