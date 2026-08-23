import { z } from "zod";

export const CATEGORY_OPTIONS = [
  "AI & Machine Learning",
  "Robotics & Automation",
  "Sustainability & Energy",
  "FinTech",
  "HealthTech",
  "Game Design",
] as const;

export type CategoryOption = (typeof CATEGORY_OPTIONS)[number];

export const criteriaTemplateSchema = z
  .object({
    templateName: z
      .string()
      .trim()
      .min(3, "Template name must be at least 3 characters")
      .max(80, "Template name must be 80 characters or fewer"),
    category: z.enum(CATEGORY_OPTIONS, { error: "Select a category" }),
    metrics: z
      .array(
        z.object({
          name: z.string().trim().min(2, "Metric name must be at least 2 characters"),
          weight: z.coerce
            .number({ error: "Enter a valid weight" })
            .min(1, "Weight must be at least 1")
            .max(100, "Weight cannot exceed 100"),
        }),
      )
      .min(1, "Add at least one evaluation metric"),
    requiredHeadings: z
      .array(
        z.object({
          value: z.string().trim().min(2, "Heading must be at least 2 characters"),
        }),
      )
      .min(1, "Add at least one required heading"),
  })
  .superRefine((data, ctx) => {
    const total = data.metrics.reduce((sum, metric) => sum + metric.weight, 0);
    if (total !== 100) {
      ctx.addIssue({
        code: "custom",
        message: `Metric weights must add up to 100% (currently ${total}%)`,
        path: ["metrics"],
      });
    }
  });

/** Raw form field shape, as entered (weight may be a string before coercion). */
export type CriteriaTemplateFormInput = z.input<typeof criteriaTemplateSchema>;
/** Parsed/coerced shape produced on successful submit. */
export type CriteriaTemplateFormValues = z.output<typeof criteriaTemplateSchema>;

export const DEFAULT_CRITERIA_TEMPLATE_VALUES = {
  templateName: "",
  category: undefined,
  metrics: [{ name: "", weight: 100 }],
  requiredHeadings: [{ value: "" }],
} as unknown as CriteriaTemplateFormInput;
