import { Sidebar } from "@/components/sidebar/sidebar";
import { Navbar } from "@/components/navbar/navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar - Fixed width */}
        <aside className="w-64 shrink-0 min-h-screen sticky top-0">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
