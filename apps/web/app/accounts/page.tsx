import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AccountsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-xl font-bold text-primary-900">
                SwissOne
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-700">Accounts</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.email}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Accounts</h2>
          <p className="mt-2 text-gray-600">Manage your banking accounts</p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center py-12">
              <p className="text-gray-500">No accounts found</p>
              <p className="mt-2 text-sm text-gray-400">
                Accounts will appear here once created
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

