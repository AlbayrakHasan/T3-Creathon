import { z } from "zod";

export const CATEGORY_OPTIONS = [
  "Yapay Zeka ve Makine Öğrenmesi",
  "Robotik ve Otomasyon",
  "Sürdürülebilirlik ve Enerji",
  "Finans Teknolojisi",
  "Sağlık Teknolojisi",
  "Oyun Tasarımı",
] as const;

export type CategoryOption = (typeof CATEGORY_OPTIONS)[number];

export const criteriaTemplateSchema = z
  .object({
    templateName: z
      .string()
      .trim()
      .min(3, "Şablon adı en az 3 karakter olmalı")
      .max(80, "Şablon adı en fazla 80 karakter olabilir"),
    category: z.enum(CATEGORY_OPTIONS, { error: "Bir kategori seçin" }),
    metrics: z
      .array(
        z.object({
          name: z.string().trim().min(2, "Metrik adı en az 2 karakter olmalı"),
          weight: z.coerce
            .number({ error: "Geçerli bir ağırlık girin" })
            .min(1, "Ağırlık en az 1 olmalı")
            .max(100, "Ağırlık 100'ü geçemez"),
        }),
      )
      .min(1, "En az bir değerlendirme metriği ekleyin"),
    requiredHeadings: z
      .array(
        z.object({
          value: z.string().trim().min(2, "Başlık en az 2 karakter olmalı"),
        }),
      )
      .min(1, "En az bir zorunlu başlık ekleyin"),
  })
  .superRefine((data, ctx) => {
    const total = data.metrics.reduce((sum, metric) => sum + metric.weight, 0);
    if (total !== 100) {
      ctx.addIssue({
        code: "custom",
        message: `Metrik ağırlıkları toplamda %100 olmalı (şu anda %${total})`,
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
