import "@testing-library/jest-dom";
import { vi, beforeAll, afterEach } from "vitest";

// Suppress iframe / external URL network errors in happy-dom (Google Maps etc.)
const originalError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  const msg = String(args[0]);
  if (msg.includes("NetworkError") || msg.includes("DOMException") || msg.includes("fetch()")) return;
  originalError(...args);
};

// Stub browser APIs not available in happy-dom
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  Object.defineProperty(window, "scrollTo", { writable: true, value: vi.fn() });
  Object.defineProperty(window, "open", { writable: true, value: vi.fn() });

  // IntersectionObserver (used by framer-motion / whileInView)
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as unknown as typeof IntersectionObserver;

  // ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as unknown as typeof ResizeObserver;
});

// Reset all mocks between tests
afterEach(() => {
  vi.clearAllMocks();
});
