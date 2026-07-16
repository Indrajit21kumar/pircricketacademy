/**
 * Component tests for the Contact / Enquiry form.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Contact from "@/components/Contact";

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

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Helper: fill ALL required fields (including ageGroup select) and submit ──
function fillAndSubmit(
  name = "Rakesh Singh",
  phone = "9876543210",
  child = "Arjun",
  address = "Test Colony, Patna",
) {
  fireEvent.change(screen.getByPlaceholderText("Ramesh Kumar"), { target: { value: name } });
  fireEvent.change(screen.getByPlaceholderText("+91 98765 43210"), { target: { value: phone } });
  fireEvent.change(screen.getByPlaceholderText("Arjun Kumar"), { target: { value: child } });
  fireEvent.change(screen.getByPlaceholderText("House No., Area, Patna, Bihar"), { target: { value: address } });
  // Age Group select is required — must pick a value
  fireEvent.change(screen.getByDisplayValue("Select age group"), { target: { value: "U12 (Under 12)" } });
  fireEvent.click(screen.getByRole("button", { name: /Register My Interest/i }));
}

describe("Contact component", () => {
  describe("Rendering", () => {
    it("renders the section heading", () => {
      render(<Contact />);
      expect(screen.getByText(/Start Your Cricket Journey/i)).toBeInTheDocument();
    });

    it("renders the 'Register Interest' badge", () => {
      render(<Contact />);
      expect(screen.getByText(/Register Interest/i)).toBeInTheDocument();
    });

    it("renders the parent name field (placeholder: Ramesh Kumar)", () => {
      render(<Contact />);
      expect(screen.getByPlaceholderText("Ramesh Kumar")).toBeInTheDocument();
    });

    it("renders the phone number field", () => {
      render(<Contact />);
      expect(screen.getByPlaceholderText("+91 98765 43210")).toBeInTheDocument();
    });

    it("renders the child's name field", () => {
      render(<Contact />);
      expect(screen.getByPlaceholderText("Arjun Kumar")).toBeInTheDocument();
    });

    it("renders the address field", () => {
      render(<Contact />);
      expect(screen.getByPlaceholderText("House No., Area, Patna, Bihar")).toBeInTheDocument();
    });

    it("renders the submit button 'Register My Interest'", () => {
      render(<Contact />);
      expect(screen.getByRole("button", { name: /Register My Interest/i })).toBeInTheDocument();
    });

    it("renders the Age Group dropdown with placeholder", () => {
      render(<Contact />);
      expect(screen.getByDisplayValue("Select age group")).toBeInTheDocument();
    });

    it("renders all 6 age group options", () => {
      render(<Contact />);
      const select = screen.getByDisplayValue("Select age group") as HTMLSelectElement;
      const options = Array.from(select.options).map(o => o.text);
      expect(options).toContain("U8 (Under 8)");
      expect(options).toContain("U12 (Under 12)");
      expect(options).toContain("U16 (Under 16)");
      expect(options).toContain("U19 (Under 19)");
      expect(options).toContain("Elite");
      expect(options).toContain("Not sure");
    });

    it("renders the academy phone numbers", () => {
      render(<Contact />);
      const matches = screen.getAllByText("+91 89360 61688");
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it("renders the academy address (Anisabad, Patna, Bihar)", () => {
      render(<Contact />);
      expect(screen.getByText(/Anisabad, Patna, Bihar/i)).toBeInTheDocument();
    });

    it("renders 'Register your interest for free' call to action", () => {
      render(<Contact />);
      expect(screen.getByText(/Register your interest for free/i)).toBeInTheDocument();
    });

    it("renders a 'How did you hear' source dropdown", () => {
      render(<Contact />);
      expect(screen.getByDisplayValue("Select source")).toBeInTheDocument();
    });

    it("source dropdown includes WhatsApp, Google Search, and Walk-in options", () => {
      render(<Contact />);
      const select = screen.getByDisplayValue("Select source") as HTMLSelectElement;
      const options = Array.from(select.options).map(o => o.text);
      expect(options).toContain("WhatsApp");
      expect(options).toContain("Google Search");
      expect(options).toContain("Walk-in");
    });
  });

  describe("Form submission", () => {
    it("opens WhatsApp when form is submitted", () => {
      render(<Contact />);
      fillAndSubmit();
      expect(window.open).toHaveBeenCalled();
      const url = (window.open as any).mock.calls[0][0] as string;
      expect(url).toMatch(/wa\.me/);
    });

    it("WhatsApp URL targets the academy's number (918936061688)", () => {
      render(<Contact />);
      fillAndSubmit();
      const url = (window.open as any).mock.calls[0][0] as string;
      expect(url).toContain("918936061688");
    });

    it("WhatsApp message includes parent name", () => {
      render(<Contact />);
      fillAndSubmit("Ramesh Kumar");
      const url = (window.open as any).mock.calls[0][0] as string;
      expect(decodeURIComponent(url)).toContain("Ramesh Kumar");
    });

    it("WhatsApp message includes child name", () => {
      render(<Contact />);
      fillAndSubmit("Parent", "9000000001", "LittleStar");
      const url = (window.open as any).mock.calls[0][0] as string;
      expect(decodeURIComponent(url)).toContain("LittleStar");
    });

    it("WhatsApp message includes phone number", () => {
      render(<Contact />);
      fillAndSubmit("Dad", "9876543999", "Child");
      const url = (window.open as any).mock.calls[0][0] as string;
      expect(decodeURIComponent(url)).toContain("9876543999");
    });

    it("transitions to success state after submission", () => {
      render(<Contact />);
      fillAndSubmit();
      expect(screen.getByText(/Registration Received/i)).toBeInTheDocument();
    });

    it("shows parent name in success message", () => {
      render(<Contact />);
      fillAndSubmit("Suresh Gupta");
      expect(screen.getByText(/Suresh Gupta/)).toBeInTheDocument();
    });

    it("shows phone in success message", () => {
      render(<Contact />);
      fillAndSubmit("Dad", "9876500000");
      expect(screen.getByText(/9876500000/)).toBeInTheDocument();
    });

    it("shows 'Also WhatsApp Us' button in success state", () => {
      render(<Contact />);
      fillAndSubmit();
      expect(screen.getByText(/Also WhatsApp Us/i)).toBeInTheDocument();
    });

    it("shows PIR branding in success state", () => {
      render(<Contact />);
      fillAndSubmit();
      expect(screen.getByText(/PIR Cricket Academy/i)).toBeInTheDocument();
    });
  });

  describe("Accessibility and links", () => {
    it("form is inside a section#contact landmark", () => {
      const { container } = render(<Contact />);
      expect(container.querySelector("section#contact")).toBeTruthy();
    });

    it("phone link has a tel: href", () => {
      render(<Contact />);
      const telLink = document.querySelector('a[href^="tel:"]') as HTMLAnchorElement;
      expect(telLink).toBeTruthy();
      expect(telLink.href).toMatch(/tel:/);
    });

    it("Google Maps link opens maps.google.com", () => {
      render(<Contact />);
      const mapLink = screen.getByRole("link", { name: /Open in Google Maps/i });
      expect(mapLink).toHaveAttribute("href", expect.stringContaining("maps.google.com"));
    });

    it("map iframe has an accessible title mentioning Patna", () => {
      const { container } = render(<Contact />);
      const iframe = container.querySelector("iframe");
      expect(iframe?.title).toMatch(/Anisabad|Patna/i);
    });

    it("WhatsApp link has target='_blank'", () => {
      render(<Contact />);
      const waLink = document.querySelector('a[href*="wa.me"]') as HTMLAnchorElement;
      expect(waLink?.target).toBe("_blank");
    });
  });
});
