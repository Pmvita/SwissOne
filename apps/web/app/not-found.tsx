import { notFound } from "next/navigation";

// Force this to be a dynamic route that never gets statically generated
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

// This function tells Next.js not to generate this page statically
export async function generateStaticParams() {
  return [];
}

export default function NotFound() {
  // This will trigger the not-found page to be rendered dynamically
  notFound();
}

