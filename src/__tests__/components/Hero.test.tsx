/**
 * Component tests for the Hero section.
 * The Hero renders: heading, sub-text, feature pills, partner badges, countdown, CTA buttons, address.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Hero from "@/components/Hero";

vi.mock("wouter", () => ({
  Link: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
  useLocation: () => ["/", vi.fn()],
}));

vi.mock("framer-motion", () => ({
  motion: new Proxy({} as Record<string, unknown>, {
    get: (_target, prop: string) => {
      const Tag = prop as keyof JSX.IntrinsicElements;
      return ({ children, ...rest }: any) => {
        const { initial, animate, whileInView, viewport, transition, ...domProps } = rest;
        // Remove motion-only props from dom elements
        if (typeof Tag === "string") {
          const { style: _s, ...clean } = domProps;
          return <Tag style={_s} {...clean}>{children}</Tag>;
        }
        return <Tag {...domProps}>{children}</Tag>;
      };
    },
  }),
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("Hero component", () => {
  describe("Main heading", () => {
    it("renders 'Forge Your Legacy'", () => {
      render(<Hero />);
      expect(screen.getByText(/Forge Your Legacy/i)).toBeInTheDocument();
    });

    it("renders 'on the Pitch.'", () => {
      render(<Hero />);
      expect(screen.getByText(/on the Pitch\./i)).toBeInTheDocument();
    });

    it("renders the Bihar/India tagline quote", () => {
      render(<Hero />);
      expect(screen.getByText(/From the Soil of Bihar/i)).toBeInTheDocument();
    });
  });

  describe("Coming Soon status", () => {
    it("shows 'Coming Soon in Patna, Bihar' (academy not yet open)", () => {
      render(<Hero />);
      expect(screen.getByText(/Coming Soon in Patna, Bihar/i)).toBeInTheDocument();
    });

    it("shows 'Early Admissions Now Open' text", () => {
      render(<Hero />);
      expect(screen.getByText(/Early Admissions Now Open/i)).toBeInTheDocument();
    });

    it("renders the 'Academy Opening In' countdown label", () => {
      render(<Hero />);
      expect(screen.getByText(/Academy Opening In/i)).toBeInTheDocument();
    });

    it("renders 'Days' countdown label", () => {
      render(<Hero />);
      expect(screen.getByText("Days")).toBeInTheDocument();
    });

    it("renders 'Hours' countdown label", () => {
      render(<Hero />);
      expect(screen.getByText("Hours")).toBeInTheDocument();
    });

    it("renders 'Mins' countdown label", () => {
      render(<Hero />);
      expect(screen.getByText("Mins")).toBeInTheDocument();
    });

    it("renders 'Secs' countdown label", () => {
      render(<Hero />);
      expect(screen.getByText("Secs")).toBeInTheDocument();
    });
  });

  describe("Feature pills", () => {
    it("shows 'Expert BCCI Coaches' pill", () => {
      render(<Hero />);
      expect(screen.getByText(/Expert BCCI Coaches/i)).toBeInTheDocument();
    });

    it("shows 'HD Video Analysis' pill", () => {
      render(<Hero />);
      expect(screen.getByText(/HD Video Analysis/i)).toBeInTheDocument();
    });

    it("shows 'Strength & Fitness' pill", () => {
      render(<Hero />);
      expect(screen.getByText(/Strength & Fitness/i)).toBeInTheDocument();
    });

    it("shows 'Indoor Nets' pill", () => {
      render(<Hero />);
      expect(screen.getByText(/Indoor Nets/i)).toBeInTheDocument();
    });
  });

  describe("Partner badges", () => {
    it("mentions S.P Sports & Cultural Foundation", () => {
      render(<Hero />);
      expect(screen.getByText(/S\.P Sports/i)).toBeInTheDocument();
    });

    it("mentions Savera Cancer Hospital", () => {
      render(<Hero />);
      expect(screen.getByText(/Savera Cancer Hospital/i)).toBeInTheDocument();
    });
  });

  describe("CTA buttons", () => {
    it("renders 'Apply for Admission' link", () => {
      render(<Hero />);
      expect(screen.getByText(/Apply for Admission/i)).toBeInTheDocument();
    });

    it("Apply link points to /admissions", () => {
      render(<Hero />);
      const link = screen.getByText(/Apply for Admission/i).closest("a");
      expect(link?.getAttribute("href")).toBe("/admissions");
    });

    it("renders 'Founding Batch Benefits' button", () => {
      render(<Hero />);
      expect(screen.getByRole("button", { name: /Founding Batch Benefits/i })).toBeInTheDocument();
    });
  });

  describe("Address strip", () => {
    it("renders the full academy address", () => {
      render(<Hero />);
      expect(screen.getByText(/Sector-A, Police Colony, Anisabad, Patna/i)).toBeInTheDocument();
    });

    it("renders '800002' pin code", () => {
      render(<Hero />);
      expect(screen.getByText(/800002/)).toBeInTheDocument();
    });
  });

  describe("Scroll indicator", () => {
    it("renders the 'Scroll' hint text", () => {
      render(<Hero />);
      expect(screen.getByText("Scroll")).toBeInTheDocument();
    });
  });
});
