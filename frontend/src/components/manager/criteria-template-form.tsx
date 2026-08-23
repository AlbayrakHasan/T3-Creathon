"use client";

import { useId, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CATEGORY_OPTIONS,
  criteriaTemplateSchema,
  DEFAULT_CRITERIA_TEMPLATE_VALUES,
  type CriteriaTemplateFormInput,
  type CriteriaTemplateFormValues,
} from "@/lib/criteria-template";

interface CriteriaTemplateFormProps {
  onSaved?: (values: CriteriaTemplateFormValues) => void;
}

export function CriteriaTemplateForm({ onSaved }: CriteriaTemplateFormProps) {
  const [savedTemplateName, setSavedTemplateName] = useState<string | null>(null);
  const formHeadingId = useId();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CriteriaTemplateFormInput, unknown, CriteriaTemplateFormValues>({
    resolver: zodResolver(criteriaTemplateSchema),
    defaultValues: DEFAULT_CRITERIA_TEMPLATE_VALUES,
    mode: "onSubmit",
  });

  const metricsArray = useFieldArray({ control, name: "metrics" });
  const headingsArray = useFieldArray({ control, name: "requiredHeadings" });

  const metricsError =
    errors.metrics?.root?.message ??
    (typeof errors.metrics?.message === "string" ? errors.metrics.message : undefined);
  const headingsError =
    errors.requiredHeadings?.root?.message ??
    (typeof errors.requiredHeadings?.message === "string"
      ? errors.requiredHeadings.message
      : undefined);

  function onValid(values: CriteriaTemplateFormValues) {
    setSavedTemplateName(values.templateName);
    onSaved?.(values);
    reset(DEFAULT_CRITERIA_TEMPLATE_VALUES);
  }

  return (
    <section
      aria-labelledby={formHeadingId}
      className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2 id={formHeadingId} className="text-xl font-bold text-foreground">
          Criteria &amp; Template Definition
        </h2>
        <p className="mt-1 text-sm text-muted">
          Define the evaluation metrics, category, and required report headings referees and the
          AI evaluator will use for this competition.
        </p>
      </div>

      {savedTemplateName && (
        <div
          role="status"
          data-testid="template-saved-banner"
          className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
        >
          <span>Template &ldquo;{savedTemplateName}&rdquo; saved successfully.</span>
          <button
            type="button"
            onClick={() => setSavedTemplateName(null)}
            aria-label="Dismiss saved template message"
            className="rounded-md p-1 text-emerald-700 transition hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            ×
          </button>
        </div>
      )}

      <form
        noValidate
        onSubmit={handleSubmit(onValid)}
        data-testid="criteria-template-form"
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="templateName" className="text-sm font-semibold text-foreground">
            Template name
          </label>
          <input
            id="templateName"
            type="text"
            placeholder="e.g. Robotics & Automation — Final Round"
            aria-invalid={errors.templateName ? "true" : "false"}
            aria-describedby={errors.templateName ? "templateName-error" : undefined}
            {...register("templateName")}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
          />
          {errors.templateName && (
            <p id="templateName-error" role="alert" className="text-xs font-medium text-red-600">
              {errors.templateName.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-sm font-semibold text-foreground">
            Category
          </label>
          <select
            id="category"
            defaultValue=""
            aria-invalid={errors.category ? "true" : "false"}
            aria-describedby={errors.category ? "category-error" : undefined}
            {...register("category")}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="" disabled>
              Select a category
            </option>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p id="category-error" role="alert" className="text-xs font-medium text-red-600">
              {errors.category.message}
            </p>
          )}
        </div>

        <fieldset className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-semibold text-foreground">Evaluation metrics</legend>
            <button
              type="button"
              onClick={() => metricsArray.append({ name: "", weight: 0 })}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:border-brand-300 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              + Add metric
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {metricsArray.fields.map((field, index) => {
              const nameError = errors.metrics?.[index]?.name?.message;
              const weightError = errors.metrics?.[index]?.weight?.message;
              return (
                <div key={field.id} className="flex items-start gap-2">
                  <div className="flex flex-1 flex-col gap-1">
                    <label htmlFor={`metrics.${index}.name`} className="sr-only">
                      Metric {index + 1} name
                    </label>
                    <input
                      id={`metrics.${index}.name`}
                      type="text"
                      placeholder="e.g. Technical feasibility"
                      aria-invalid={nameError ? "true" : "false"}
                      aria-describedby={nameError ? `metrics.${index}.name-error` : undefined}
                      {...register(`metrics.${index}.name` as const)}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                    />
                    {nameError && (
                      <p
                        id={`metrics.${index}.name-error`}
                        role="alert"
                        className="text-xs font-medium text-red-600"
                      >
                        {nameError}
                      </p>
                    )}
                  </div>

                  <div className="flex w-28 flex-col gap-1">
                    <label htmlFor={`metrics.${index}.weight`} className="sr-only">
                      Metric {index + 1} weight percentage
                    </label>
                    <div className="relative">
                      <input
                        id={`metrics.${index}.weight`}
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        aria-invalid={weightError ? "true" : "false"}
                        aria-describedby={
                          weightError ? `metrics.${index}.weight-error` : undefined
                        }
                        {...register(`metrics.${index}.weight` as const)}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 pr-7 text-sm text-foreground outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                      />
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted">
                        %
                      </span>
                    </div>
                    {weightError && (
                      <p
                        id={`metrics.${index}.weight-error`}
                        role="alert"
                        className="text-xs font-medium text-red-600"
                      >
                        {weightError}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => metricsArray.remove(index)}
                    disabled={metricsArray.fields.length === 1}
                    aria-label={`Remove metric ${index + 1}`}
                    className="mt-0.5 rounded-lg border border-border px-2.5 py-2 text-xs font-semibold text-muted transition hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          {metricsError && (
            <p role="alert" className="text-xs font-medium text-red-600">
              {metricsError}
            </p>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-semibold text-foreground">Required headings</legend>
            <button
              type="button"
              onClick={() => headingsArray.append({ value: "" })}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:border-brand-300 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              + Add heading
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {headingsArray.fields.map((field, index) => {
              const headingError = errors.requiredHeadings?.[index]?.value?.message;
              return (
                <div key={field.id} className="flex items-start gap-2">
                  <div className="flex flex-1 flex-col gap-1">
                    <label htmlFor={`requiredHeadings.${index}.value`} className="sr-only">
                      Required heading {index + 1}
                    </label>
                    <input
                      id={`requiredHeadings.${index}.value`}
                      type="text"
                      placeholder="e.g. Methodology"
                      aria-invalid={headingError ? "true" : "false"}
                      aria-describedby={
                        headingError ? `requiredHeadings.${index}.value-error` : undefined
                      }
                      {...register(`requiredHeadings.${index}.value` as const)}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                    />
                    {headingError && (
                      <p
                        id={`requiredHeadings.${index}.value-error`}
                        role="alert"
                        className="text-xs font-medium text-red-600"
                      >
                        {headingError}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => headingsArray.remove(index)}
                    disabled={headingsArray.fields.length === 1}
                    aria-label={`Remove required heading ${index + 1}`}
                    className="mt-0.5 rounded-lg border border-border px-2.5 py-2 text-xs font-semibold text-muted transition hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          {headingsError && (
            <p role="alert" className="text-xs font-medium text-red-600">
              {headingsError}
            </p>
          )}
        </fieldset>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save template
          </button>
        </div>
      </form>
    </section>
  );
}
