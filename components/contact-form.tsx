import {
  RelationshipFields,
  profileOf,
} from "@/components/relationship-traits-fields";
import type { RelationshipProfile } from "@/lib/relationship-model";
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
      // Legacy field kept for compatibility; no longer edited or shown.
      strength: initialData?.strength ?? 0.5,
      ...profileOf((initialData ?? {}) as Record<string, unknown>),
    },
  });

  const selectedLevelId = watch("levelId");

  const profile: RelationshipProfile = profileOf(
    watch() as unknown as Record<string, unknown>,
  );
  const patchProfile = (patch: Partial<RelationshipProfile>) => {
    for (const [k, v] of Object.entries(patch)) {
      setValue(k as keyof ContactFormData, v as never, { shouldDirty: true });
    }
  };

  const handleFormSubmit = async (data: ContactFormData) => {
    try {
      // The legacy day interval follows the user's own wish when given.
      const desired = data.desiredContactPerMonth;
      if (desired !== undefined && desired > 0) {
        data.contactFrequency = Math.min(
          365,
          Math.max(1, Math.round(30 / desired)),
        );
      }
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
            </div>

            <RelationshipFields
              value={profile}
              onChange={patchProfile}
              disabled={isLoading || isSubmitting}
            />
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
