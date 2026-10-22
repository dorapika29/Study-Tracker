'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-red-500 mb-4">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 rounded-md shadow text-white"
        style={{ backgroundColor: 'rgb(var(--primary))' }}
      >
        Try again
      </button>
    </div>
  );
}