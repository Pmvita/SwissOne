import Link from "next/link";

// Prevent static generation of 404 page
export const dynamic = "force-dynamic";
export const dynamicParams = true;

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

