import { z } from "zod";
import { router, publicProcedure } from "../trpc";

/**
 * ============================================================
 *  SESSION ROUTER — YOUR TASK
 * ============================================================
 *
 *  Implement the four tRPC procedures below. Each procedure has:
 *    - A description of what it should do
 *    - The expected input schema (already defined)
 *    - Hints about edge cases to handle
 *
 *  The Prisma client is available via `ctx.prisma`.
 *  Refer to prisma/schema.prisma for the data model.
 *
 *  Run `npm test` to check your progress — all tests should pass.
 * ============================================================
 */

export const sessionRouter = router({
  /**
   * PROCEDURE 1: getAvailableSessions
   *
   * Return a tutor's FUTURE sessions that still have available capacity.
   *
   * Requirements:
   *   - Only return sessions where startsAt is in the future
   *   - Only return sessions that are NOT fully booked
   *   - A session's booked count should only include "confirmed" bookings
   *     (cancelled bookings do NOT count towards capacity)
   *   - Include the tutor's name and subject in the response
   *   - Include how many spots remain for each session
   *   - Order results by startsAt ascending (soonest first)
   */
  getAvailableSessions: publicProcedure
    .input(
      z.object({
        tutorId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();

      const sessions = await ctx.prisma.session.findMany({
        where: {
          tutorId: input.tutorId,
          startsAt: {
            gt: now,
          },
        },
        include: {
          tutor: {
            select: {
              name: true,
              subject: true,
            },
          },
          _count: {
            select: {
              bookings: {
                where: {
                  status: "confirmed",
                },
              },
            },
          },
        },
        orderBy: {
          startsAt: "asc",
        },
      });

      const availableSessions = sessions
        .filter((session) => session._count.bookings < session.capacity)
        .map((session) => {
          const { _count, tutor, ...rest } = session;
          return {
            ...rest,
            tutorName: tutor.name,
            tutorSubject: tutor.subject,
            spotsRemaining: session.capacity - _count.bookings,
          };
        });

      return availableSessions;
    }),

  /**
   * PROCEDURE 2: bookSession
   *
   * Book a student into a session.
   *
   * Requirements:
   *   - Validate the session exists and is in the future
   *   - Validate the session is not fully booked (confirmed bookings only)
   *   - Prevent duplicate bookings (same student + same session)
   *     BUT: if the student previously cancelled, allow them to re-book
   *   - Return the created booking with session details
   *
   * Error handling — throw descriptive errors for:
   *   - Session not found
   *   - Session is in the past
   *   - Session is fully booked
   *   - Student already has a confirmed booking for this session
   */
  bookSession: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
        sessionId: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { studentId, sessionId, notes } = input;
      const now = new Date();

      const session = await ctx.prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          bookings: {
            where: {
              status: "confirmed",
            },
          },
        },
      });

      if (!session) {
        throw new Error("Session not found");
      }

      if (session.startsAt <= now) {
        throw new Error("Session is in the past");
      }

      if (session.bookings.length >= session.capacity) {
        throw new Error("Session is fully booked");
      }

      const existingBooking = await ctx.prisma.booking.findFirst({
        where: {
          studentId,
          sessionId,
        },
      });

      if (existingBooking) {
        if (existingBooking.status === "confirmed") {
          throw new Error("Student already has a confirmed booking for this session");
        }
        // If cancelled, allow re-booking by updating the status
        return ctx.prisma.booking.update({
          where: { id: existingBooking.id },
          data: { status: "confirmed", notes },
          include: { session: true },
        });
      }

      return ctx.prisma.booking.create({
        data: {
          studentId,
          sessionId,
          notes,
          status: "confirmed",
        },
        include: {
          session: true,
        },
      });
    }),

  /**
   * PROCEDURE 3: cancelBooking
   *
   * Cancel an existing booking.
   *
   * Requirements:
   *   - Find the booking by ID
   *   - Only allow cancellation if the booking status is "confirmed"
   *   - Only allow cancellation if the session hasn't started yet
   *   - Set the booking status to "cancelled" (do NOT delete it)
   *   - Return the updated booking
   *
   * Error handling — throw descriptive errors for:
   *   - Booking not found
   *   - Booking is already cancelled
   *   - Session has already started or passed
   */
  cancelBooking: publicProcedure
    .input(
      z.object({
        bookingId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { bookingId } = input;
      const now = new Date();

      const booking = await ctx.prisma.booking.findUnique({
        where: { id: bookingId },
        include: { session: true },
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status === "cancelled") {
        throw new Error("Booking is already cancelled");
      }

      if (booking.session.startsAt <= now) {
        throw new Error("Session has already started or passed");
      }

      return ctx.prisma.booking.update({
        where: { id: bookingId },
        data: { status: "cancelled" },
      });
    }),

  /**
   * PROCEDURE 4: getStudentBookings
   *
   * Return all bookings for a given student.
   *
   * Requirements:
   *   - Include session details (title, startsAt, endsAt) and tutor name
   *   - Include the booking status
   *   - Order by session startsAt descending (most recent first)
   *   - Optionally filter by status if provided
   */
  getStudentBookings: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
        status: z.enum(["confirmed", "cancelled"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { studentId, status } = input;

      const bookings = await ctx.prisma.booking.findMany({
        where: {
          studentId,
          status,
        },
        include: {
          session: {
            include: {
              tutor: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          session: {
            startsAt: "desc",
          },
        },
      });

      return bookings.map((booking) => {
        const { session, ...rest } = booking;
        return {
          ...rest,
          session: {
            id: session.id,
            title: session.title,
            startsAt: session.startsAt,
            endsAt: session.endsAt,
          },
          tutorName: session.tutor.name,
        };
      });
    }),
});
