"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-6 text-center px-6">
      <h2 className="text-2xl font-heading font-semibold text-white">Something went wrong!</h2>
      <p className="text-neutral-400 max-w-md">An error occurred while loading this section. Please try again or refresh the page.</p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
