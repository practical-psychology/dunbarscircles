import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import OnboardingPage from "../../pages/OnboardingPage";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("OnboardingPage", () => {
  it("renders the welcome message", () => {
    renderWithRouter(<OnboardingPage />);

    expect(
      screen.getByRole("heading", {
        name: "Welcome to Dunbar Circles",
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Learn how to visualize and understand your relationships",
      ),
    ).toBeInTheDocument();
  });

  it("displays tutorial steps navigation", () => {
    renderWithRouter(<OnboardingPage />);

    expect(screen.getByText("Tutorial Steps")).toBeInTheDocument();
    expect(screen.getAllByText("Welcome to Dunbar Circles")).toHaveLength(4); // Title, sidebar, content title, and step content
    expect(screen.getByText("Navigation Overview")).toBeInTheDocument();
  });

  it("shows progress indicator", () => {
    renderWithRouter(<OnboardingPage />);

    expect(screen.getByText("1 of 8")).toBeInTheDocument();
  });

  it("displays navigation controls", () => {
    renderWithRouter(<OnboardingPage />);

    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
    expect(screen.getByText("Mark Complete")).toBeInTheDocument();
  });

  it("shows quick start links", () => {
    renderWithRouter(<OnboardingPage />);

    expect(screen.getByText("Quick Start")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Radial View")).toBeInTheDocument();
    expect(screen.getByText("Network")).toBeInTheDocument();
    expect(screen.getByText("Levels")).toBeInTheDocument();
  });

  it("displays Dunbar number explanation in first step", () => {
    renderWithRouter(<OnboardingPage />);

    expect(screen.getByText("What is Dunbar's Number?")).toBeInTheDocument();
    expect(screen.getByText("Inner Circle (5)")).toBeInTheDocument();
    expect(screen.getByText("Sympathy Group (15)")).toBeInTheDocument();
    expect(screen.getByText("Affinity Group (50)")).toBeInTheDocument();
    expect(screen.getByText("Active Network (150)")).toBeInTheDocument();
    expect(screen.getByText("Recognition Group (500)")).toBeInTheDocument();
  });
});
