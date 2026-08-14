"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useBookAccess } from "@/domains/books/hooks/useBookAccess";
import { useBooks } from "@/domains/books";
import { useAuth } from "@/auth/hooks/useAuth";
import { Button, Card, Input, Spinner } from "@/shared/components";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function MemberBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ParticipantsPage() {
  const params = useParams<{ bookId: string }>();
  const bookId = params.bookId;
  const router = useRouter();
  const { user } = useAuth();

  const { book: accessBook, isOwner, loading, forbidden } = useBookAccess(bookId);
  const { books, addParticipant, removeParticipant } = useBooks();

  // Use the live book from the useBooks reducer so the participant list
  // updates immediately after add/remove without a page refresh.
  // Fall back to the access hook's snapshot while useBooks is still loading.
  const book = books.find((b) => b.id === bookId) ?? accessBook;

  const [uidInput, setUidInput] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addingUid, setAddingUid] = useState<string | null>(null);
  const [removingUid, setRemovingUid] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Redirect non-owners away from this page.
  useEffect(() => {
    if (!loading && !forbidden && book && !isOwner) {
      router.replace(`/books/${bookId}/transactions`);
    }
  }, [loading, forbidden, book, isOwner, bookId, router]);

  // Redirect if forbidden (no access at all).
  useEffect(() => {
    if (!loading && forbidden) {
      router.replace("/books?error=forbidden");
    }
  }, [loading, forbidden, router]);

  if (loading || !book) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isOwner) return null; // redirect pending

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const uid = uidInput.trim();
    if (!uid) return;

    // Prevent adding self.
    if (uid === user?.uid) {
      setAddError("You are already the owner of this book.");
      return;
    }
    // Prevent duplicates.
    if (book!.participants.includes(uid)) {
      setAddError("This user is already a participant.");
      return;
    }

    setAddError(null);
    setAddingUid(uid);
    try {
      await addParticipant(bookId, uid);
      setUidInput("");
      inputRef.current?.focus();
    } catch {
      setAddError("Could not add participant. Please try again.");
    } finally {
      setAddingUid(null);
    }
  }

  async function handleRemove(uid: string) {
    setRemovingUid(uid);
    try {
      await removeParticipant(bookId, uid);
    } catch {
      // Non-blocking — the list will simply not update; a retry is possible.
    } finally {
      setRemovingUid(null);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Participants</h1>

      {/* Owner row */}
      <section aria-labelledby="owner-heading" className="mb-6">
        <h2 id="owner-heading" className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Owner
        </h2>
        <Card className="flex items-center justify-between p-4">
          <span className="truncate text-sm font-medium text-gray-900">
            {book.ownerId === user?.uid ? `You (${user?.email ?? book.ownerId})` : book.ownerId}
          </span>
          <MemberBadge label="Owner" />
        </Card>
      </section>

      {/* Participants list */}
      <section aria-labelledby="participants-heading" className="mb-8">
        <h2 id="participants-heading" className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Participants
        </h2>
        {book.participants.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
            No participants yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-2" aria-label="Participant list">
            {book.participants.map((uid) => (
              <li key={uid}>
                <Card className="flex items-center justify-between p-4">
                  <span className="truncate text-sm font-medium text-gray-900">{uid}</span>
                  <div className="flex shrink-0 items-center gap-3">
                    <MemberBadge label="Participant" />
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={removingUid === uid}
                      onClick={() => handleRemove(uid)}
                    >
                      {removingUid === uid ? "Removing…" : "Remove"}
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add participant */}
      <section aria-labelledby="add-heading">
        <h2 id="add-heading" className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Add participant
        </h2>

        {/* Limitation notice */}
        <div className="mb-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800" role="note">
          <strong>How to find a UID:</strong> The person you want to invite can find their Firebase
          UID in the app&apos;s account/profile section once they have registered. Enter it exactly
          as shown.
        </div>

        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <Input
            ref={inputRef}
            id="participant-uid"
            label="Firebase UID"
            placeholder="e.g. abc123XYZ..."
            value={uidInput}
            onChange={(e) => { setUidInput(e.target.value); setAddError(null); }}
            error={addError ?? undefined}
            aria-describedby={addError ? "add-error" : undefined}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={!uidInput.trim() || addingUid !== null}>
              {addingUid ? "Adding…" : "+ Add participant"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
