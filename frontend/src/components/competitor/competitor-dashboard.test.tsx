import { render, screen, within } from "@testing-library/react";
import { CompetitorDashboard } from "./competitor-dashboard";
import {
  getCompetitorSummary,
  MOCK_PUBLISHED_EVALUATION,
  toCompetitorSummary,
} from "@/lib/competitor-feedback";

const summary = getCompetitorSummary();

describe("CompetitorDashboard", () => {
  it("renders the final status with outcome, score, and headline", () => {
    render(<CompetitorDashboard />);

    const status = screen.getByTestId("final-status");
    expect(within(status).getByRole("heading", { level: 1 })).toHaveTextContent(
      summary.projectName,
    );
    expect(screen.getByTestId("outcome-badge")).toHaveTextContent("Advanced");
    expect(screen.getByTestId("status-headline")).toHaveTextContent(summary.headline);
    expect(status).toHaveTextContent(String(summary.finalScore));
    expect(status).toHaveTextContent(summary.category);
  });

  it("renders every strength as a titled, readable feedback entry", () => {
    render(<CompetitorDashboard />);

    const section = screen.getByTestId("strengths-section");
    expect(within(section).getByRole("heading", { name: "Strengths" })).toBeInTheDocument();
    expect(within(section).getAllByRole("listitem")).toHaveLength(summary.strengths.length);

    for (const point of summary.strengths) {
      expect(within(section).getByRole("heading", { name: point.title })).toBeInTheDocument();
      expect(section).toHaveTextContent(point.detail);
    }
  });

  it("renders every area for improvement as a titled, readable feedback entry", () => {
    render(<CompetitorDashboard />);

    const section = screen.getByTestId("improvements-section");
    expect(
      within(section).getByRole("heading", { name: "Areas for Improvement" }),
    ).toBeInTheDocument();
    expect(within(section).getAllByRole("listitem")).toHaveLength(
      summary.improvements.length,
    );

    for (const point of summary.improvements) {
      expect(within(section).getByRole("heading", { name: point.title })).toBeInTheDocument();
      expect(section).toHaveTextContent(point.detail);
    }
  });

  it("renders the next-step guidance", () => {
    render(<CompetitorDashboard />);

    expect(screen.getByTestId("next-step-section")).toHaveTextContent(summary.nextStep);
  });

  it("keeps strengths and improvements in visually separate sections", () => {
    render(<CompetitorDashboard />);

    const strengths = screen.getByTestId("strengths-section");
    const improvements = screen.getByTestId("improvements-section");
    expect(strengths).not.toContainElement(improvements);
    expect(strengths).toHaveTextContent(summary.strengths[0].title);
    expect(strengths).not.toHaveTextContent(summary.improvements[0].title);
  });
});

describe("CompetitorDashboard — data exposure", () => {
  it("never renders referee-only fields from the underlying evaluation record", () => {
    render(<CompetitorDashboard />);

    const page = screen.getByTestId("competitor-dashboard");
    expect(page).not.toHaveTextContent(MOCK_PUBLISHED_EVALUATION.refereeName);
    expect(page).not.toHaveTextContent(MOCK_PUBLISHED_EVALUATION.refereeNotes);
    expect(page).not.toHaveTextContent(/internal:/i);
  });

  it("never surfaces raw AI analysis internals", () => {
    render(<CompetitorDashboard />);

    const page = screen.getByTestId("competitor-dashboard");
    expect(page).not.toHaveTextContent(/plagiarism/i);
    expect(page).not.toHaveTextContent(/similarity/i);
    expect(page).not.toHaveTextContent(/ai 4th eye/i);
    expect(page).not.toHaveTextContent(/confidence/i);
    expect(page).not.toHaveTextContent(/suggested score/i);
  });

  it("exposes no administrative or referee controls", () => {
    render(<CompetitorDashboard />);

    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.queryAllByRole("spinbutton")).toHaveLength(0);
    expect(screen.queryAllByRole("combobox")).toHaveLength(0);
    expect(screen.queryByTestId("final-decision-form")).not.toBeInTheDocument();
    expect(screen.queryByTestId("ai-analysis-report")).not.toBeInTheDocument();
    expect(screen.queryByText(/submit final decision/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/upload/i)).not.toBeInTheDocument();
  });

  it("projects only whitelisted keys out of the internal evaluation record", () => {
    const projected = toCompetitorSummary(MOCK_PUBLISHED_EVALUATION);

    expect(Object.keys(projected).sort()).toEqual([
      "category",
      "finalScore",
      "headline",
      "improvements",
      "nextStep",
      "outcome",
      "projectName",
      "reportId",
      "reviewedAt",
      "strengths",
      "submittedAt",
    ]);
    for (const leaked of [
      "refereeName",
      "refereeNotes",
      "aiSuggestedScore",
      "aiSuggestedOutcome",
      "similarityScore",
      "message",
    ]) {
      expect(projected).not.toHaveProperty(leaked);
    }
  });

  it("does not leak referee-only data added to the record after projection", () => {
    const withExtraInternalField = {
      ...MOCK_PUBLISHED_EVALUATION,
      internalAuditTrail: "referee-42 overrode the engine on 2026-08-19",
    };

    const projected = toCompetitorSummary(withExtraInternalField);

    expect(projected).not.toHaveProperty("internalAuditTrail");
    expect(JSON.stringify(projected)).not.toContain("referee-42");
  });
});
