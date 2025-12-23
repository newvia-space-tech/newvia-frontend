// app/not-found.tsx

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-bold">404</h1>

      <p className="mt-4 text-lg text-gray-600">
        Oops! The page you&apos;re looking for doesn&apos;t exist.
      </p>

      <Link
        href="/"
        className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
      >
        Go back home
      </Link>
    </main>
  );
}
