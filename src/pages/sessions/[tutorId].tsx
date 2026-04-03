import { useRouter } from "next/router";
import { useState } from "react";
import { trpc } from "~/utils/trpc";
import SessionCard from "~/components/SessionCard";

const STUDENT_ID = "student-01";

export default function TutorSessionsPage() {
  const router = useRouter();
  const tutorId = router.query.tutorId as string;
  const [bookingSessionId, setBookingSessionId] = useState<string | null>(null);

  const sessions = trpc.session.getAvailableSessions.useQuery(
    { tutorId },
    { enabled: !!tutorId }
  );

  const bookSession = trpc.session.bookSession.useMutation({
    onSuccess: () => {
      setBookingSessionId(null);
      sessions.refetch();
    },
    onError: () => {
      setBookingSessionId(null);
    },
  });

  const handleBook = (sessionId: string) => {
    setBookingSessionId(sessionId);
    bookSession.mutate({ studentId: STUDENT_ID, sessionId });
  };

  return (
    <main className="max-w-xl mx-auto p-8 font-sans">
      <h1 className="text-2xl font-bold">Tutor Sessions</h1>

      {sessions.isLoading && <p className="mt-4 text-gray-500">Loading sessions…</p>}
      {sessions.error && <p className="mt-4 text-red-600">Error: {sessions.error.message}</p>}
      {bookSession.error && <p className="mt-4 text-red-600">Booking failed: {bookSession.error.message}</p>}

      {sessions.data?.length === 0 && (
        <p className="mt-4 text-gray-500">No available sessions for this tutor.</p>
      )}

      <div className="mt-4 space-y-4">
        {sessions.data?.map((session) => (
          <SessionCard
            key={session.id}
            title={session.title}
            startsAt={session.startsAt as unknown as string}
            endsAt={session.endsAt as unknown as string}
            spotsRemaining={session.spotsRemaining}
            isBooking={bookingSessionId === session.id}
            onBook={() => handleBook(session.id)}
          />
        ))}
      </div>
    </main>
  );
}
