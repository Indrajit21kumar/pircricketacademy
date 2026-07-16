/**
 * Integration tests for the Booking page (ground / pitch reservation).
 * The Booking page is a 3-step flow:
 *   Step 1 → Select Facility (facility cards shown here)
 *   Step 2 → Select Date & Time (date input + slot grid)
 *   Step 3 → Details & Pay
 */
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import Booking from "@/pages/Booking";

// ── MSW server ────────────────────────────────────────────────────────────────
const server = setupServer(
  http.get("/api/bookings/slots", ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get("date");
    const facility = url.searchParams.get("facility");
    if (!date || !facility) return HttpResponse.json({ error: "Missing params" }, { status: 400 });
    return HttpResponse.json({ bookedSlots: ["06:00 AM"] }); // one booked slot
  }),

  http.post("/api/bookings", () =>
    HttpResponse.json({
      bookingId: 99, orderId: "order_booking_test", keyId: "rzp_test_key",
      amount: 150000, ref: "PIRABC12345",
    }, { status: 201 }),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

vi.mock("framer-motion", () => ({
  motion: new Proxy({} as Record<string, unknown>, {
    get: (_target, prop: string) => {
      const Tag = prop as keyof JSX.IntrinsicElements;
      return ({ children, ...rest }: any) => {
        const { initial, animate, whileInView, viewport, transition, ...domProps } = rest;
        return <Tag {...domProps}>{children}</Tag>;
      };
    },
  }),
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock("wouter", () => ({
  Link: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
  useLocation: () => ["/book", vi.fn()],
}));

vi.mock("@/components/Navbar", () => ({ default: () => <nav data-testid="navbar" /> }));
vi.mock("@/components/Footer", () => ({ default: () => <footer data-testid="footer" /> }));

// ── Step 1: Facility selection (initial view) ─────────────────────────────────
describe("Booking page — Step 1: Facility selection", () => {
  it("renders the main heading 'Book a Facility'", () => {
    render(<Booking />);
    expect(screen.getByText(/Book a Facility/i)).toBeInTheDocument();
  });

  it("renders the facility types subtitle", () => {
    render(<Booking />);
    expect(screen.getByText(/Box Cricket.*Turf Wicket.*Cement Wicket/i)).toBeInTheDocument();
  });

  it("renders 3 step navigation pills (Facility / Date & Time / Details & Pay)", () => {
    render(<Booking />);
    expect(screen.getByText("Facility")).toBeInTheDocument();
    expect(screen.getByText("Date & Time")).toBeInTheDocument();
    expect(screen.getByText("Details & Pay")).toBeInTheDocument();
  });

  it("renders the 'Box Cricket Arena' facility card", () => {
    render(<Booking />);
    expect(screen.getByText("Box Cricket Arena")).toBeInTheDocument();
  });

  it("renders the 'Turf Wicket' facility card", () => {
    render(<Booking />);
    expect(screen.getByText("Turf Wicket")).toBeInTheDocument();
  });

  it("renders the 'Astro Turf / Cemented Wicket' facility card", () => {
    render(<Booking />);
    expect(screen.getByText(/Astro Turf.*Cemented Wicket/i)).toBeInTheDocument();
  });

  it("renders the 'Bowling Machine Bay' facility card", () => {
    render(<Booking />);
    expect(screen.getByText("Bowling Machine Bay")).toBeInTheDocument();
  });

  it("shows weekday pricing for Box Cricket Arena (₹1500/hr)", () => {
    render(<Booking />);
    expect(screen.getByText("₹1500/hr")).toBeInTheDocument();
  });

  it("shows weekday pricing for Turf Wicket (₹800/hr)", () => {
    render(<Booking />);
    expect(screen.getByText("₹800/hr")).toBeInTheDocument();
  });

  it("shows weekday pricing for Cement Wicket (₹500/hr)", () => {
    render(<Booking />);
    expect(screen.getByText("₹500/hr")).toBeInTheDocument();
  });

  it("shows weekday pricing for Bowling Machine (₹300/30min)", () => {
    render(<Booking />);
    expect(screen.getByText("₹300/30min")).toBeInTheDocument();
  });

  it("renders the 'Select Facility' section heading", () => {
    render(<Booking />);
    expect(screen.getByText("Select Facility")).toBeInTheDocument();
  });
});

// ── Step 2: Date & Time (after selecting a facility) ─────────────────────────
describe("Booking page — Step 2: Date & Time", () => {
  async function goToStep2() {
    render(<Booking />);
    // Click the Box Cricket Arena card to advance to step 2
    const boxCard = screen.getByText("Box Cricket Arena").closest("button");
    if (boxCard) fireEvent.click(boxCard);
    await waitFor(() => {
      expect(screen.getByText("Select Date & Time")).toBeInTheDocument();
    });
  }

  it("renders 'Select Date & Time' heading after selecting a facility", async () => {
    await goToStep2();
    expect(screen.getByText("Select Date & Time")).toBeInTheDocument();
  });

  it("renders a date input after selecting a facility", async () => {
    await goToStep2();
    const dateInput = document.querySelector("input[type='date']");
    expect(dateInput).toBeTruthy();
  });

  it("renders time slot buttons after selecting a facility", async () => {
    await goToStep2();
    // Slot buttons: 06:00 AM, 07:00 AM, etc.
    expect(screen.getByText("06:00 AM")).toBeInTheDocument();
    expect(screen.getByText("09:00 PM")).toBeInTheDocument();
  });

  it("renders all 16 time slot buttons", async () => {
    await goToStep2();
    const allSlots = ["06:00 AM","07:00 AM","08:00 AM","09:00 AM","10:00 AM","11:00 AM",
                      "12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM",
                      "06:00 PM","07:00 PM","08:00 PM","09:00 PM"];
    for (const slot of allSlots) {
      expect(screen.getByText(slot)).toBeInTheDocument();
    }
  });

  it("fetches slot availability when date is changed", async () => {
    let slotsFetched = false;
    server.use(
      http.get("/api/bookings/slots", () => {
        slotsFetched = true;
        return HttpResponse.json({ bookedSlots: [] });
      }),
    );
    await goToStep2();
    const dateInput = document.querySelector("input[type='date']") as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2025-12-25" } });
    await waitFor(() => { expect(slotsFetched).toBe(true); }, { timeout: 3000 });
  });

  it("marks the booked slot (06:00 AM) with a 'Booked' label", async () => {
    server.use(
      http.get("/api/bookings/slots", () =>
        HttpResponse.json({ bookedSlots: ["06:00 AM"] }),
      ),
    );
    await goToStep2();
    const dateInput = document.querySelector("input[type='date']") as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2025-12-25" } });
    await waitFor(() => {
      expect(screen.getByText("Booked")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("renders a 'Back' button to go back to facility selection", async () => {
    await goToStep2();
    expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();
  });

  it("clicking Back returns to facility selection (Step 1)", async () => {
    await goToStep2();
    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    await waitFor(() => {
      expect(screen.getByText("Box Cricket Arena")).toBeInTheDocument();
    });
  });
});

// ── Error handling ────────────────────────────────────────────────────────────
describe("Booking page — error handling", () => {
  it("does not crash when slots API returns 500", async () => {
    server.use(
      http.get("/api/bookings/slots", () =>
        HttpResponse.json({ error: "DB error" }, { status: 500 }),
      ),
    );
    render(<Booking />);
    expect(screen.getByText(/Book a Facility/i)).toBeInTheDocument();
    // Navigate to step 2
    const boxCard = screen.getByText("Box Cricket Arena").closest("button");
    if (boxCard) fireEvent.click(boxCard);
    await waitFor(() => {
      expect(screen.getByText("Select Date & Time")).toBeInTheDocument();
    });
    const dateInput = document.querySelector("input[type='date']") as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2025-12-25" } });
    // Should silently handle the error (no crash, no unbooked slots shown as booked)
    await waitFor(() => {
      expect(screen.queryByText("Booked")).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
