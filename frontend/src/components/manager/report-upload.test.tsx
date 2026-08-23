import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportUpload } from "./report-upload";

function makeFile(name: string, type: string): File {
  return new File(["dummy content"], name, { type });
}

function dropFiles(dropzone: HTMLElement, files: File[]) {
  const dataTransfer = {
    files,
    items: files.map((file) => ({ kind: "file", type: file.type, getAsFile: () => file })),
    types: ["Files"],
  };

  return act(async () => {
    const { fireEvent } = await import("@testing-library/react");
    fireEvent.dragEnter(dropzone, { dataTransfer });
    fireEvent.drop(dropzone, { dataTransfer });
  });
}

describe("ReportUpload", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders an accessible dropzone with no uploads initially", () => {
    render(<ReportUpload />);

    expect(
      screen.getByRole("button", { name: /rapor dosyalarını yükleyin/i }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("upload-list")).not.toBeInTheDocument();
  });

  it("shows a dragging visual state on drag enter and clears it on drop", async () => {
    render(<ReportUpload progressIntervalMs={10} />);
    const dropzone = screen.getByTestId("upload-dropzone");
    const file = makeFile("evaluation-report.pdf", "application/pdf");

    const { fireEvent } = await import("@testing-library/react");
    const dataTransfer = { files: [file], items: [], types: ["Files"] };

    act(() => {
      fireEvent.dragEnter(dropzone, { dataTransfer });
    });
    expect(dropzone).toHaveAttribute("data-dragging", "true");

    act(() => {
      fireEvent.drop(dropzone, { dataTransfer });
    });
    expect(dropzone).toHaveAttribute("data-dragging", "false");
  });

  it("accepts a dropped PDF file, shows upload progress, then a success state", async () => {
    const onUploadComplete = jest.fn();
    render(<ReportUpload progressIntervalMs={10} progressStepPercent={50} onUploadComplete={onUploadComplete} />);
    const dropzone = screen.getByTestId("upload-dropzone");
    const file = makeFile("evaluation-report.pdf", "application/pdf");

    await dropFiles(dropzone, [file]);

    const item = screen.getByTestId("upload-item-evaluation-report.pdf");
    expect(item).toHaveAttribute("data-status", "uploading");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");

    act(() => {
      jest.advanceTimersByTime(10);
    });
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");

    act(() => {
      jest.advanceTimersByTime(10);
    });

    expect(item).toHaveAttribute("data-status", "success");
    expect(screen.getByText(/yüklendi/i)).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(onUploadComplete).toHaveBeenCalledWith("evaluation-report.pdf");
  });

  it("accepts Word documents as valid uploads", async () => {
    render(<ReportUpload progressIntervalMs={10} />);
    const dropzone = screen.getByTestId("upload-dropzone");
    const file = makeFile(
      "report.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );

    await dropFiles(dropzone, [file]);

    expect(screen.getByTestId("upload-item-report.docx")).toHaveAttribute(
      "data-status",
      "uploading",
    );
  });

  it("shows an error state for unsupported file types", async () => {
    render(<ReportUpload progressIntervalMs={10} />);
    const dropzone = screen.getByTestId("upload-dropzone");
    const file = makeFile("notes.txt", "text/plain");

    await dropFiles(dropzone, [file]);

    const item = screen.getByTestId("upload-item-notes.txt");
    expect(item).toHaveAttribute("data-status", "error");
    expect(screen.getByRole("alert")).toHaveTextContent(/desteklenmeyen dosya türü/i);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("removes an upload item when its remove button is clicked", async () => {
    const user = userEvent.setup({
      advanceTimers: (ms) => act(() => jest.advanceTimersByTime(ms)),
    });
    render(<ReportUpload progressIntervalMs={10} />);
    const dropzone = screen.getByTestId("upload-dropzone");
    const file = makeFile("notes.txt", "text/plain");

    await dropFiles(dropzone, [file]);
    expect(screen.getByTestId("upload-item-notes.txt")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /kaldır: notes\.txt/i }));
    expect(screen.queryByTestId("upload-item-notes.txt")).not.toBeInTheDocument();
  });

  it("opens the file picker via keyboard interaction on the dropzone", async () => {
    const user = userEvent.setup({
      advanceTimers: (ms) => act(() => jest.advanceTimersByTime(ms)),
    });
    render(<ReportUpload />);
    const dropzone = screen.getByTestId("upload-dropzone");
    const input = screen.getByTestId("upload-file-input") as HTMLInputElement;
    const clickSpy = jest.spyOn(input, "click");

    dropzone.focus();
    await user.keyboard("{Enter}");

    expect(clickSpy).toHaveBeenCalled();
  });
});
