import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact AI Blaze — Get in Touch" },
      { name: "description", content: "Contact the AI Blaze team. Email aiblaze.io@gmail.com or use the form for partnerships, press, and feedback." },
      { name: "keywords", content: "contact AI Blaze, AI tool directory contact, partnerships, press inquiries, feedback" },
      { property: "og:title", content: "Contact AI Blaze" },
      { property: "og:description", content: "Get in touch with the AI Blaze team." },
      { property: "og:url", content: "https://aiblaze.io/contact" },
    ],
    links: [{ rel: "canonical", href: "https://aiblaze.io/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !email.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    // Stored as a bug_report with severity=contact so it shows in the admin inbox alongside reports.
    const { error } = await supabase.from("bug_reports").insert({
      title: `[Contact] ${title.trim().slice(0, 180)}`,
      description: body.trim().slice(0, 4000),
      page_url: typeof window !== "undefined" ? window.location.href : null,
      severity: "contact",
      reporter_email: email.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't send: " + error.message);
      return;
    }
    toast.success("Message sent — we'll reply to your email.");
    setTitle(""); setBody(""); setEmail("");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pt-12 pb-24 w-full">
        <span className="text-xs uppercase tracking-[0.2em] text-primary-ink">Contact</span>
        <h1 className="font-display text-5xl md:text-6xl mt-3">Get in touch</h1>
        <p className="text-muted-foreground mt-4 max-w-xl">Partnerships, press, feedback, or just saying hi — we read everything.</p>

        <a href="mailto:aiblaze.io@gmail.com" className="mt-6 inline-flex items-center gap-2 text-foreground hover:text-primary-ink">
          <Mail className="w-4 h-4" /> aiblaze.io@gmail.com
        </a>

        <form onSubmit={onSubmit} className="mt-10 space-y-4 max-w-xl">
          <div>
            <Label htmlFor="c-email">Your email</Label>
            <Input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="c-title">Subject</Label>
            <Input id="c-title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
          </div>
          <div>
            <Label htmlFor="c-body">Message</Label>
            <Textarea id="c-body" value={body} onChange={(e) => setBody(e.target.value)} rows={6} required maxLength={4000} />
          </div>
          <Button type="submit" disabled={submitting}>{submitting ? "Sending…" : "Send message"}</Button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
