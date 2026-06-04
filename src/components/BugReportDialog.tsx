import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function BugReportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please add a title and description.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("bug_reports").insert({
      title: title.trim().slice(0, 200),
      description: description.trim().slice(0, 4000),
      page_url: typeof window !== "undefined" ? window.location.href : null,
      severity,
      reporter_email: email.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't send bug report: " + error.message);
      return;
    }
    toast.success("Thanks — your bug report was sent!");
    setTitle(""); setDescription(""); setEmail(""); setSeverity("medium");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Report a bug</DialogTitle>
          <DialogDescription>
            Found something broken? Tell us what happened — we read every report.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="bug-title">Title</Label>
            <Input id="bug-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short summary" required maxLength={200} />
          </div>
          <div>
            <Label htmlFor="bug-desc">What happened?</Label>
            <Textarea id="bug-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Steps to reproduce, what you expected, what actually happened…" rows={5} required maxLength={4000} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="bug-severity">Severity</Label>
              <select id="bug-severity" value={severity} onChange={(e) => setSeverity(e.target.value)}
                className="w-full rounded-md bg-background border border-input px-3 py-2 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <Label htmlFor="bug-email">Your email (optional)</Label>
              <Input id="bug-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" maxLength={200} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Sending…" : "Send report"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
