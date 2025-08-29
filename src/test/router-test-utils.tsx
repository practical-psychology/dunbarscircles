import { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter, Router } from "react-router-dom";
import { createMemoryHistory, type MemoryHistory } from "history";

// Enhanced Router wrapper that ensures proper context
export const RouterWrapper = ({
  children,
  initialEntries = ["/"],
  history,
}: {
  children: ReactNode;
  initialEntries?: string[];
  history?: MemoryHistory;
}) => {
  if (history) {
    return (
      <Router navigator={history} location={history.location}>
        {children}
      </Router>
    );
  }

  return (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  );
};

// Enhanced render function that always provides Router context
export const renderWithRouterContext = (
  ui: ReactElement,
  options: {
    initialEntries?: string[];
    history?: MemoryHistory;
    renderOptions?: Omit<RenderOptions, "wrapper">;
  } = {},
) => {
  const { initialEntries, history, renderOptions } = options;

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <RouterWrapper initialEntries={initialEntries} history={history}>
      {children}
    </RouterWrapper>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Create memory history for tests that need navigation control
export const createTestHistory = (initialEntries: string[] = ["/"]) => {
  return createMemoryHistory({ initialEntries });
};

// Helper to ensure Router context is available in tests
export const withRouterContext = (
  component: ReactElement,
  initialEntries: string[] = ["/"],
) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>{component}</MemoryRouter>
  );
};
