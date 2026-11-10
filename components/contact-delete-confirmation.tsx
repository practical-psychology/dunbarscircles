import React, {
  useState,
  ReactNode,
  forwardRef,
  createContext,
  useContext,
  useMemo,
} from "react";
import { toast } from "sonner";
import { dunbarLevels } from "@/data/dunbarLevels";

// Alert Dialog Components
interface AlertDialogProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface AlertDialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AlertDialogContext = createContext<AlertDialogContextType | null>(null);

const AlertDialog: React.FC<AlertDialogProps> = ({
  children,
  open: controlledOpen,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(controlledOpen || false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : isOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setIsOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const contextValue = useMemo(
    () => ({
      open: open ?? false,
      onOpenChange: handleOpenChange,
    }),
    [open, handleOpenChange],
  );

  return (
    <AlertDialogContext.Provider value={contextValue}>
      {children}
    </AlertDialogContext.Provider>
  );
};

interface AlertDialogTriggerProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "ref"> {
  children: ReactNode;
  asChild?: boolean;
}

const AlertDialogTrigger = forwardRef<
  HTMLButtonElement,
  AlertDialogTriggerProps
>(({ children, asChild = false, ...props }, ref) => {
  const context = useContext(AlertDialogContext);

  if (!context) {
    throw new Error("AlertDialogTrigger must be used within an AlertDialog");
  }

  const { onOpenChange } = context;

  if (asChild && React.isValidElement(children)) {
    const childProps: React.HTMLAttributes<HTMLElement> & {
      ref?: React.Ref<HTMLElement>;
    } = {
      "aria-haspopup": "dialog",
      "aria-expanded": "false",
      "aria-controls": "alert-dialog",
    };

    // Only add ref if it's a function ref
    if (ref) {
      childProps.ref = ref as React.Ref<HTMLElement>;
    }

    const originalOnClick = (children as React.ReactElement<any>).props.onClick;
    if (originalOnClick) {
      childProps.onClick = (e: React.MouseEvent) => {
        onOpenChange?.(true);
        originalOnClick(e);
      };
    } else {
      childProps.onClick = () => onOpenChange?.(true);
    }

    return React.cloneElement(children, childProps);
  } else {
    return (
      <button
        type="button"
        onClick={() => onOpenChange?.(true)}
        aria-haspopup="dialog"
        aria-expanded="false"
        aria-controls="alert-dialog"
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
});

AlertDialogTrigger.displayName = "AlertDialogTrigger";

interface AlertDialogDescriptionProps {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
}

interface AlertDialogContentProps {
  children: ReactNode;
  className?: string;
}

interface AlertDialogFooterProps {
  children: ReactNode;
  className?: string;
}

const AlertDialogContent = ({
  children,
  className = "",
  ...props
}: AlertDialogContentProps) => {
  const context = useContext(AlertDialogContext);
  if (!context?.open) return null;
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 px-4 py-8"
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) context.onOpenChange(false);
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className={`bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md mx-auto mt-12 shadow-xl ${className}`}
        {...props}
      >
        <div className={`mb-4`}>{children}</div>
      </div>
    </div>
  );
};

interface AlertDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const AlertDialogHeader = ({ children }: AlertDialogHeaderProps) => (
  <div className="mb-4">{children}</div>
);

interface AlertDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

const AlertDialogTitle = ({
  children,
  className = "",
  ...props
}: AlertDialogTitleProps) => (
  <h3 className={`text-lg font-medium ${className}`} {...props}>
    {children}
  </h3>
);

interface AlertDialogDescriptionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
}

const AlertDialogDescription = forwardRef<
  HTMLDivElement,
  AlertDialogDescriptionProps
>(({ children, className = "", asChild = false, ...props }, ref) => {
  const content = (
    <div
      className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );

  if (asChild && React.isValidElement(children)) {
    const childProps: React.HTMLAttributes<HTMLElement> & {
      ref?: React.Ref<HTMLElement>;
    } = {
      className: `text-sm text-gray-500 dark:text-gray-400 ${className}`,
      ...props,
    };

    // Only add ref if it's a function ref
    if (ref) {
      childProps.ref = ref as React.Ref<HTMLElement>;
    }

    return React.cloneElement(children, childProps);
  }

  return content;
});

AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogFooter = ({
  children,
  className = "",
  ...props
}: AlertDialogFooterProps) => (
  <div className={`flex justify-end gap-2 ${className}`} {...props}>
    {children}
  </div>
);

interface AlertDialogActionProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

const AlertDialogAction = ({
  children,
  className = "",
  ...props
}: AlertDialogActionProps) => (
  <button
    className={`px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 ${className}`}
    {...props}
  >
    {children}
  </button>
);

interface AlertDialogCancelProps {
  children: ReactNode;
  className?: string;
  [key: string]: any;
}

const AlertDialogCancel = ({
  children,
  className = "",
  ...props
}: AlertDialogCancelProps) => (
  <button
    className={`px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Button Component
import { Button } from "./ui/button";

// Badge Component
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | "link";
  asChild?: boolean;
}

const Badge = ({
  children,
  variant = "default",
  className = "",
  asChild = false,
  ...props
}: BadgeProps) => {
  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground border border-input",
  };

  if (asChild) {
    return React.Children.only(children);
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant as keyof typeof variantStyles]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// Icons
const Trash2 = ({ className = "" }: { className?: string }) => (
  <span className={className}>🗑️</span>
);

const AlertTriangle = ({ className = "" }: { className?: string }) => (
  <span className={className}>⚠️</span>
);

const Loader2 = ({ className = "" }: { className?: string }) => (
  <span className={`animate-spin ${className}`}>⏳</span>
);

interface ContactDeleteConfirmationProps {
  contact: {
    id: string;
    name: string;
    levelId: string;
    platform?: string;
    lastContact?: Date;
    strength?: number;
  };
  onDelete: (contactId: string) => Promise<void>;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  isLoading?: boolean;
}

export function ContactDeleteConfirmation({
  contact,
  onDelete,
  trigger,
  isOpen,
  onOpenChange,
  isLoading = false,
}: ContactDeleteConfirmationProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setOpen(newOpen);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(contact.id);
      toast.success("Contact deleted", {
        description: `${contact.name} has been removed from your contacts.`,
      });
      handleOpenChange(false);
    } catch (error) {
      console.error("Failed to delete contact:", error);
      toast.error("Failed to delete contact", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isControlled = isOpen !== undefined && onOpenChange !== undefined;
  const modalOpen = isControlled ? isOpen : open;

  // Get level information
  const level = dunbarLevels.find((l) => l.id === contact.levelId);
  const levelName = level?.name || "Unknown Circle";

  // Determine warning level based on relationship strength and circle
  const getWarningLevel = () => {
    if (!contact.strength) return "medium";

    if (
      contact.strength >= 0.7 ||
      contact.levelId === "inner-circle" ||
      contact.levelId === "sympathy-group"
    ) {
      return "high";
    } else if (
      contact.strength >= 0.4 ||
      contact.levelId === "affinity-group"
    ) {
      return "medium";
    } else {
      return "low";
    }
  };

  const warningLevel = getWarningLevel();

  const getWarningMessage = () => {
    switch (warningLevel) {
      case "high":
        return {
          title: "⚠️ High Impact Deletion",
          message:
            "This contact is in your close circle with strong relationship ties. Deleting them may significantly impact your social network visualization.",
          color: "text-red-600",
        };
      case "medium":
        return {
          title: "⚠️ Moderate Impact Deletion",
          message:
            "This contact has moderate relationship strength. Consider if you want to move them to a different circle instead of deleting.",
          color: "text-orange-600",
        };
      case "low":
        return {
          title: "ℹ️ Low Impact Deletion",
          message:
            "This contact has low relationship strength and can be safely removed with minimal impact on your network.",
          color: "text-blue-600",
        };
    }
  };

  const warning = getWarningMessage();

  return (
    <AlertDialog open={modalOpen} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <AlertDialogTrigger asChild>
          {trigger || (
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Delete Contact
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Are you sure you want to delete <strong>{contact.name}</strong>?
                This action cannot be undone.
              </p>

              {/* Contact Information */}
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Circle:</span>
                  <Badge variant="secondary">{levelName}</Badge>
                </div>

                {contact.platform && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Platform:</span>
                    <span className="text-sm capitalize">
                      {contact.platform}
                    </span>
                  </div>
                )}

                {contact.strength !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Relationship Strength:
                    </span>
                    <span className="text-sm">
                      {Math.round(contact.strength * 100)}%
                    </span>
                  </div>
                )}

                {contact.lastContact && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Contact:</span>
                    <span className="text-sm">
                      {contact.lastContact.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Warning Message */}
              <div
                className={`p-3 rounded-lg border-l-4 ${
                  warningLevel === "high"
                    ? "bg-red-50 border-red-400 dark:bg-red-950"
                    : warningLevel === "medium"
                      ? "bg-orange-50 border-orange-400 dark:bg-orange-950"
                      : "bg-blue-50 border-blue-400 dark:bg-blue-950"
                }`}
              >
                <h4 className={`font-medium text-sm ${warning.color}`}>
                  {warning.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {warning.message}
                </p>
              </div>

              {/* Alternative Actions */}
              {warningLevel !== "low" && (
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300">
                    💡 Alternative Actions:
                  </h4>
                  <ul className="text-sm text-blue-600 dark:text-blue-400 mt-1 space-y-1">
                    <li>• Move to a different circle (Recognition Group)</li>
                    <li>• Edit contact information instead of deleting</li>
                    <li>• Mark as inactive rather than removing completely</li>
                  </ul>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting || isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting || isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Contact
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
