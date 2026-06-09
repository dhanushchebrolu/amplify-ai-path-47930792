import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About AI Blaze — The AI Tool Directory" },
      { name: "description", content: "AI Blaze is the curated directory of AI tools — discover, compare, and learn the best AI tools for writing, image, video, audio, coding, and more." },
      { name: "keywords", content: "about AI Blaze, AI tool directory, AI discovery platform, best AI tools 2026, AI productivity, AI for creators" },
      { property: "og:title", content: "About AI Blaze" },
      { property: "og:description", content: "The curated directory of AI tools." },
      { property: "og:url", content: "https://aiblaze.io/about" },
    ],
    links: [{ rel: "canonical", href: "https://aiblaze.io/about" }],
  }),
  component: () => (
    <LegalPage title="About AI Blaze">
      <p>AI Blaze is the everything-AI platform — a curated directory of AI tools across writing, video, image, audio, coding, marketing, SEO, and more, plus prompts, step-by-step tutorials, and discovery games.</p>

      <h2>What we do</h2>
      <ul>
        <li><strong>Browse</strong> hundreds of AI tools, organized by category and use case.</li>
        <li><strong>Prompts</strong> — a growing library of battle-tested prompts with full guides.</li>
        <li><strong>Learn</strong> — Spin, Scratch, and Swipe games to discover new AI tasks and workflows.</li>
        <li><strong>Blog</strong> — daily writing on what's new and what's working in AI.</li>
      </ul>

      <h2>Who we're for</h2>
      <p>Creators, builders, students, marketers, and anyone who wants to keep up with — and actually use — the best AI tools without drowning in noise.</p>

      <h2>Get in touch</h2>
      <p>Email <a href="mailto:aiblaze.io@gmail.com">aiblaze.io@gmail.com</a> or visit <a href="/contact">Contact</a>.</p>
    </LegalPage>
  ),
});
