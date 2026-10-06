import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EmailComposerDialog } from "@/components/EmailComposerDialog";
import { parseEmailDraft } from "@/lib/email-draft";

afterEach(cleanup);
const customer = { name: "Test Customer", company: "Test Company", email: "test@example.com" };

describe("email review", () => {
  it("parses formatted subjects and preserves the signature", () => {
    expect(parseEmailDraft("**Subject:** Next steps\n\nHi there,\n\nBest regards,\nSalesAgent AI Team\nSalesAgent AI")).toEqual({ subject: "Next steps", body: "Hi there,\n\nBest regards,\nSalesAgent AI Team\nSalesAgent AI" });
  });

  it("sends the edited content and closes only after success", async () => {
    const onSend = vi.fn().mockResolvedValue(true);
    const onOpenChange = vi.fn();
    render(<EmailComposerDialog open onOpenChange={onOpenChange} customer={customer} draft="Subject: Hello\nOriginal draft" onSend={onSend} />);
    fireEvent.change(screen.getByLabelText("Subject"), { target: { value: "Edited subject" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Edited message" } });
    fireEvent.click(screen.getByRole("button", { name: "Send email" }));
    await waitFor(() => expect(onSend).toHaveBeenCalledWith("Edited subject", "Edited message"));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("keeps edits open after a failed send and discards without sending", async () => {
    const onSend = vi.fn().mockResolvedValue(false);
    const onOpenChange = vi.fn();
    render(<EmailComposerDialog open onOpenChange={onOpenChange} customer={customer} draft="Subject: Hello\nDraft" onSend={onSend} />);
    fireEvent.click(screen.getByRole("button", { name: "Send email" }));
    await waitFor(() => expect(onSend).toHaveBeenCalledOnce());
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Discard edits" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSend).toHaveBeenCalledOnce();
  });
});