import Link from "next/link";

// Force dynamic rendering to prevent static generation issues
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Server component to avoid React 19 useContext issues during static generation
// Next.js will handle this as a server component and skip problematic static generation
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link
          href="/landing"
          className="inline-block px-6 py-3 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

