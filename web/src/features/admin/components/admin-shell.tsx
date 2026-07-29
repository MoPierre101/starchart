import { AdminTopbar } from "@/features/admin/components/admin-topbar";

export function AdminShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="admin-theme min-h-screen bg-admin-cream text-admin-ink">
      <AdminTopbar />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
