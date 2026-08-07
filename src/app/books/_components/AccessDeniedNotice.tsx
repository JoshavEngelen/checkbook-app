"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AccessDeniedNotice() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "forbidden") {
      setShow(true);
      // Strip the query param so a refresh doesn't re-show the banner.
      router.replace("/books");
    }
  }, [searchParams, router]);

  if (!show) return null;

  return (
    <div
      className="mb-4 flex items-center justify-between rounded-md bg-red-50 px-4 py-3 text-sm text-red-600"
      role="alert"
    >
      <span>You don&apos;t have permission to access that book.</span>
      <button
        type="button"
        onClick={() => setShow(false)}
        aria-label="Dismiss"
        className="ml-4 text-red-600 hover:text-red-800"
      >
        ×
      </button>
    </div>
  );
}
