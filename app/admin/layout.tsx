import { AdminNav } from "@/components/AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <AdminNav />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
