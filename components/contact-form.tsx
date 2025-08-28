import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CircleSelector } from "./circle-selector";
import { contactFormSchema, type ContactFormData } from "@/lib/contact-models";
import { toast } from "sonner";
import { Loader2, Save, X } from "lucide-react";

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<ContactFormData>;
  isLoading?: boolean;
  title?: string;
}

export function ContactForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
  title = "Add Contact",
}: ContactFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      notes: initialData?.notes || "",
      levelId: initialData?.levelId || "recognition-group",
      platform: initialData?.platform || "manual",
      tags: initialData?.tags || [],
      contactFrequency: initialData?.contactFrequency || 30,
      strength: initialData?.strength || 0.5,
    },
  });

  const selectedLevelId = watch("levelId");

  const handleFormSubmit = async (data: ContactFormData) => {
    try {
      await onSubmit(data);
      toast.success("Contact saved successfully!", {
        description: `${data.name} has been added to your ${data.levelId.replace("-", " ")} circle.`,
      });
      reset();
    } catch (error) {
      console.error("Failed to save contact:", error);
      toast.error("Failed to save contact", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto" data-testid="contact-form">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="w-5 h-5" aria-hidden="true" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-6"
          role="form"
          aria-label="Contact information form"
          noValidate
        >
          {/* Basic Information */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-medium">Basic Information</legend>

            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter contact name"
                className={errors.name ? "border-red-500" : ""}
                disabled={isLoading || isSubmitting}
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "name-error" : undefined}
                required
              />
              {errors.name && (
                <p
                  id="name-error"
                  className="text-sm text-red-500"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="contact@example.com"
                  className={errors.email ? "border-red-500" : ""}
                  disabled={isLoading || isSubmitting}
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    className="text-sm text-red-500"
                    role="alert"
                    aria-live="polite"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  placeholder="+1 (555) 123-4567"
                  className={errors.phone ? "border-red-500" : ""}
                  disabled={isLoading || isSubmitting}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Add any notes about this contact..."
                rows={3}
                className={errors.notes ? "border-red-500" : ""}
                disabled={isLoading || isSubmitting}
              />
              {errors.notes && (
                <p className="text-sm text-red-500">{errors.notes.message}</p>
              )}
            </div>
          </fieldset>

          {/* Circle Assignment */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-medium">Circle Assignment</legend>
            <CircleSelector
              selectedLevelId={selectedLevelId}
              onLevelSelect={(levelId) => setValue("levelId", levelId)}
              error={errors.levelId?.message}
              disabled={isLoading || isSubmitting}
            />
          </fieldset>

          {/* Relationship Details */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-medium">
              Relationship Details
            </legend>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform">
                  Platform/Source <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="platform"
                  {...register("platform")}
                  placeholder="e.g., work, facebook, linkedin, family"
                  className={errors.platform ? "border-red-500" : ""}
                  disabled={isLoading || isSubmitting}
                />
                {errors.platform && (
                  <p className="text-sm text-red-500">
                    {errors.platform.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactFrequency">
                  Contact Frequency (days){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactFrequency"
                  type="number"
                  min="1"
                  max="365"
                  {...register("contactFrequency", { valueAsNumber: true })}
                  placeholder="30"
                  className={errors.contactFrequency ? "border-red-500" : ""}
                  disabled={isLoading || isSubmitting}
                />
                {errors.contactFrequency && (
                  <p className="text-sm text-red-500">
                    {errors.contactFrequency.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="strength">
                Relationship Strength (0.0 - 1.0){" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="strength"
                type="number"
                min="0"
                max="1"
                step="0.1"
                {...register("strength", { valueAsNumber: true })}
                placeholder="0.5"
                className={errors.strength ? "border-red-500" : ""}
                disabled={isLoading || isSubmitting}
              />
              {errors.strength && (
                <p className="text-sm text-red-500">
                  {errors.strength.message}
                </p>
              )}
              <p className="text-sm text-gray-500">
                0.0 = Weak connection, 1.0 = Very strong connection
              </p>
            </div>
          </fieldset>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading || isSubmitting}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Contact
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
