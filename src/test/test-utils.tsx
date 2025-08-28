import { ReactElement, ReactNode, useEffect, useMemo } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { createMemoryHistory, type History } from "history";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";

// Local TestStoredContact interface for testing
type TestStoredContact = {
  id: string;
  name: string;
  levelId: string;
  lastContact: Date;
  contactFrequency: number;
  strength: number;
  decayRate: number;
  platform: string;
  email?: string;
  phone?: string;
  notes?: string;
  importDate: Date;
  source: "facebook" | "linkedin" | "manual";
  firestoreId?: string;
  syncStatus?: "synced" | "pending" | "error";
  lastSyncAt?: Date;
  tags?: string[];
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
};

// Mock theme provider for testing
const ThemeProvider = ({
  children,
  defaultTheme = "light",
  storageKey = "test-theme",
}: {
  children: ReactNode;
  defaultTheme?: "light" | "dark" | "system";
  storageKey?: string;
}) => {
  return (
    <div
      data-testid="theme-provider"
      data-theme={defaultTheme}
      data-storage-key={storageKey}
    >
      {children}
    </div>
  );
};

// Mock StoredContact interface for testing
export interface StoredContact {
  id: string;
  name: string;
  levelId: string;
  lastContact: Date;
  contactFrequency: number;
  strength: number;
  decayRate: number;
  platform: string;
  email?: string;
  phone?: string;
  notes?: string;
  importDate: Date;
  source: "facebook" | "linkedin" | "manual";
  firestoreId?: string;
  syncStatus?: "synced" | "pending" | "error";
  lastSyncAt?: Date;
  tags?: string[];
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

type RouterType = "memory" | "history";

interface TestProviderProps {
  children: ReactNode;
  routerType?: RouterType;
  initialEntries?: string[];
  theme?: "light" | "dark" | "system";
}

const HistoryRouter = ({
  children,
  history,
}: {
  children: ReactNode;
  history: History;
}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname !== history.location.pathname) {
      history.push(pathname);
    }
  }, [history, pathname]);

  return <>{children}</>;
};

export const TestProviders = ({
  children,
  routerType = "memory",
  initialEntries = ["/"],
  theme = "light",
}: TestProviderProps) => {
  const history = useMemo(
    () => createMemoryHistory({ initialEntries }),
    [initialEntries],
  );

  return routerType === "memory" ? (
    <MemoryRouter initialEntries={initialEntries}>
      <ThemeProvider defaultTheme={theme} storageKey="test-theme">
        {children}
      </ThemeProvider>
    </MemoryRouter>
  ) : (
    <HistoryRouter history={history}>
      <ThemeProvider defaultTheme={theme} storageKey="test-theme">
        {children}
      </ThemeProvider>
    </HistoryRouter>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialEntries?: string[];
  theme?: "light" | "dark" | "system";
  withRouter?: boolean;
  routerType?: RouterType;
}

const customRender = (ui: ReactElement, options: CustomRenderOptions = {}) => {
  const Wrapper = options.withRouter
    ? ({ children }: { children: ReactNode }) => (
        <TestProviders
          initialEntries={options.initialEntries}
          theme={options.theme}
          routerType={options.routerType}
        >
          {children}
        </TestProviders>
      )
    : ({ children }: { children: ReactNode }) => (
        <ThemeProvider defaultTheme={options.theme} storageKey="test-theme">
          {children}
        </ThemeProvider>
      );

  return render(ui, { wrapper: Wrapper, ...options });
};

export { customRender as render };

export const renderWithRouter = (
  ui: ReactElement,
  options: Omit<CustomRenderOptions, "withRouter"> = {},
) => customRender(ui, { ...options, withRouter: true });

export const renderWithHistory = (
  ui: ReactElement,
  options: Omit<CustomRenderOptions, "withRouter" | "routerType"> = {},
) => customRender(ui, { ...options, withRouter: true, routerType: "history" });

export const renderWithTheme = (
  ui: ReactElement,
  theme: "light" | "dark" | "system",
  options: Omit<CustomRenderOptions, "theme"> = {},
) => customRender(ui, { ...options, theme });

// Helper to mock next/router
export const mockNextRouter = (overrides = {}) => {
  const mockRouter = {
    route: "/",
    pathname: "/",
    query: {},
    asPath: "/",
    push: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn().mockResolvedValue(undefined),
    beforePopState: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    isFallback: false,
    ...overrides,
  };

  vi.mock("next/router", () => ({
    useRouter: () => mockRouter,
  }));

  return mockRouter;
};

export const waitForAsync = (ms = 0) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

type MockApiResponse<T> = {
  status: number;
  ok: boolean;
  json: () => Promise<T>;
};

type TestHelpers = {
  createMockContact: (
    overrides?: Partial<TestStoredContact>,
  ) => TestStoredContact;
  expectContactToMatch: (
    contact: TestStoredContact,
    expected: Partial<TestStoredContact>,
  ) => void;
  navigateTo: (path: string) => void;
  mockApiResponse: <T>(data: T, status?: number) => MockApiResponse<T>;
  waitForCondition: (
    condition: () => boolean,
    timeout?: number,
  ) => Promise<void>;
};

export const testHelpers: TestHelpers = {
  createMockContact: (overrides = {}) => ({
    id: overrides.id || `contact-${Math.random().toString(36).substr(2, 9)}`,
    name: overrides.name || "Test Contact",
    levelId: overrides.levelId || "level-1",
    lastContact: overrides.lastContact || new Date(),
    contactFrequency: overrides.contactFrequency || 30,
    strength: overrides.strength ?? 0.8,
    decayRate: overrides.decayRate ?? 0.1,
    platform: overrides.platform || "test",
    importDate: overrides.importDate || new Date(),
    source: overrides.source || "manual",
    ...overrides,
  }),

  expectContactToMatch: (contact, expected) => {
    Object.entries(expected).forEach(([key, value]) => {
      expect(contact[key as keyof TestStoredContact]).toEqual(value);
    });
  },

  navigateTo: (path) => {
    window.history.pushState({}, "Test page", path);
  },

  mockApiResponse: (data, status = 200) => ({
    status,
    ok: status >= 200 && status < 300,
    json: async () => data,
  }),

  waitForCondition: async (condition, timeout = 1000) => {
    const start = Date.now();
    while (!condition() && Date.now() - start < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    if (!condition()) {
      throw new Error("Condition not met within timeout");
    }
  },
};

// Export userEvent for testing interactions
export { userEvent };
