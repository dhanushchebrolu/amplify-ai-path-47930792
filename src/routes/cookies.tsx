import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — NeuroHub" },
      { name: "description", content: "How NeuroHub uses cookies and similar technologies. Essential cookies, analytics, and how to manage your preferences." },
      { name: "keywords", content: "cookie policy, cookies, tracking, web storage, NeuroHub" },
      { property: "og:title", content: "Cookie Policy — NeuroHub" },
      { property: "og:description", content: "How NeuroHub uses cookies." },
      { property: "og:url", content: "https://amplify-ai-path.lovable.app/cookies" },
    ],
    links: [{ rel: "canonical", href: "https://amplify-ai-path.lovable.app/cookies" }],
  }),
  component: () => (
    <LegalPage title="Cookie Policy" updated="June 4, 2026">
      <p>This Cookie Policy explains how NeuroHub uses cookies and similar technologies.</p>

      <h2>What are cookies?</h2>
      <p>Cookies are small text files stored on your device by your browser. They let websites remember your preferences and keep you signed in.</p>

      <h2>How we use them</h2>
      <ul>
        <li><strong>Essential</strong> — authentication and session management (you can't disable these without breaking sign-in).</li>
        <li><strong>Preferences</strong> — remember your view mode (grid/list) and other UI choices.</li>
        <li><strong>Analytics</strong> — anonymized usage data to improve the product.</li>
      </ul>

      <h2>Managing cookies</h2>
      <p>You can clear or block cookies in your browser settings. Blocking essential cookies will prevent you from signing in.</p>

      <h2>Contact</h2>
      <p>Questions? <a href="mailto:aiblaze.io@gmail.com">aiblaze.io@gmail.com</a></p>
    </LegalPage>
  ),
});
