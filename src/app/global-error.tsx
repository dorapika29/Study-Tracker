'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-50">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Something went wrong!</h2>
        <p className="text-red-500 mb-4">{error.message}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-gray-700 text-white rounded-md shadow hover:bg-gray-600"
        >
          Try again
        </button>
      </body>
    </html>
  );
}