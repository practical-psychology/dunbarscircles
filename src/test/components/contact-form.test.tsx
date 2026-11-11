import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/contact-form";
import { type ContactFormData } from "@/lib/contact-models";

// Mock the toast function
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ContactForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(<ContactForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    expect(screen.getByText(/circle assignment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/platform/i)).toBeInTheDocument();
    // Relationship model fields (separate, optional, never inferred)
    expect(screen.getByLabelText(/feelings towards them/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/how often you would like contact/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^status$/i)).toBeInTheDocument();
    // Ratings start unrated: a "Rate" button, not a pre-filled slider
    expect(screen.getAllByRole("button", { name: /^rate$/i })).toHaveLength(4);
    // Old frequency-as-strength inputs are gone
    expect(screen.queryByLabelText(/relationship strength/i)).toBeNull();
  });

  it("shows validation errors for required fields", async () => {
    const user = userEvent.setup();
    render(<ContactForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole("button", { name: /save contact/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(<ContactForm onSubmit={mockOnSubmit} />);

    // Fill in required fields
    await user.type(screen.getByLabelText(/name/i), "John Doe");

    // Clear the platform field first, then type the value
    const platformInput = screen.getByLabelText(/platform/i);
    await user.clear(platformInput);
    await user.type(platformInput, "work");

    await user.selectOptions(
      screen.getByLabelText(/feelings towards them/i),
      "dislike",
    );
    await user.type(
      screen.getByLabelText(/how often you would like contact/i),
      "2",
    );

    const submitButton = screen.getByRole("button", { name: /save contact/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "John Doe",
          email: "",
          phone: "",
          notes: "",
          platform: "work",
          stage: "dislike",
          desiredContactPerMonth: 2,
          contactFrequency: 15, // follows the wish: about every 15 days
          levelId: "recognition-group", // default value
          tags: [],
        }),
      );
    });
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<ContactForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("validates email format", async () => {
    const user = userEvent.setup();
    render(<ContactForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "invalid-email");

    const submitButton = screen.getByRole("button", { name: /save contact/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it("validates phone number format", async () => {
    const user = userEvent.setup();
    render(<ContactForm onSubmit={mockOnSubmit} />);

    const phoneInput = screen.getByLabelText(/phone/i);
    await user.type(phoneInput, "invalid-phone");

    const submitButton = screen.getByRole("button", { name: /save contact/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/invalid phone number format/i),
      ).toBeInTheDocument();
    });
  });

  it("populates form with initial data", () => {
    const initialData: Partial<ContactFormData> = {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1234567890",
      notes: "Test notes",
      levelId: "inner-circle",
      platform: "family",
      contactFrequency: 7,
      strength: 0.9,
      stage: "love",
      attachmentScore: 85,
      desiredContactPerMonth: 4,
    };

    render(<ContactForm onSubmit={mockOnSubmit} initialData={initialData} />);

    expect(screen.getByDisplayValue("Jane Smith")).toBeInTheDocument();
    expect(screen.getByDisplayValue("jane@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("+1234567890")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test notes")).toBeInTheDocument();
    expect(screen.getByDisplayValue("family")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Love")).toBeInTheDocument();
    expect(screen.getByDisplayValue("85")).toBeInTheDocument(); // slider
    expect(screen.getByDisplayValue("4")).toBeInTheDocument();
  });

  it("shows loading state when submitting", async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void;
    const submitPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });
    mockOnSubmit.mockReturnValue(submitPromise);

    render(<ContactForm onSubmit={mockOnSubmit} />);

    // Fill in required fields
    await user.type(screen.getByLabelText(/name/i), "John Doe");
    await user.type(screen.getByLabelText(/platform/i), "work");

    const submitButton = screen.getByRole("button", { name: /save contact/i });
    await user.click(submitButton);

    // Should show loading state
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Resolve the promise
    resolveSubmit!();
    await waitFor(() => {
      expect(screen.getByText(/save contact/i)).toBeInTheDocument();
    });
  });
});
