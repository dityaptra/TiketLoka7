import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 1. Parent: Full viewport height, no scroll on the body itself
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* 2. Sidebar: Fixed width, static */}
      <Sidebar />

      {/* 3. Main Content Wrapper: 
          - flex-1: Takes remaining width
          - flex & flex-col: Organizes internal content vertically
          - overflow-hidden: Crucial! Prevents this wrapper from expanding horizontally
      */}
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        {/* 4. Scrollable Content Area:
            - flex-1: Fills the height
            - overflow-x-hidden: Prevents horizontal scroll on the page level
            - overflow-y-auto: Allows vertical scrolling ONLY inside this box
        */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="container mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
