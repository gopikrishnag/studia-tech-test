import React from "react";

interface SessionCardProps {
  readonly title: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly spotsRemaining: number;
  readonly isBooking: boolean;
  readonly onBook: () => void;
}

export default function SessionCard({
  title,
  startsAt,
  endsAt,
  spotsRemaining,
  isBooking,
  onBook,
}: SessionCardProps) {
  const isFull = spotsRemaining <= 0;
  const disabled = isFull || isBooking;

  const formatDateTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getButtonLabel = () => {
    if (isBooking) return "Booking…";
    if (isFull) return "Full";
    return "Book";
  };

  const spotsLabel = spotsRemaining === 1 ? "spot" : "spots";
  const spotsText = isFull
    ? "No spots remaining"
    : `${spotsRemaining} ${spotsLabel} remaining`;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

      <p className="mt-1 text-sm text-gray-600">
        {formatDateTime(startsAt)} – {formatDateTime(endsAt)}
      </p>

      <p className={`mt-2 text-sm font-medium ${isFull ? "text-red-600" : "text-green-600"}`}>
        {spotsText}
      </p>

      <button
        type="button"
        disabled={disabled}
        onClick={onBook}
        className={`mt-3 w-full rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          disabled
            ? "cursor-not-allowed bg-gray-200 text-gray-500"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {getButtonLabel()}
      </button>
    </div>
  );
}
