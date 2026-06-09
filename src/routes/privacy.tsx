import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — AI Blaze" },
      { name: "description", content: "How AI Blaze collects, uses, and protects your personal data. GDPR & CCPA compliant privacy practices for our AI tool directory." },
      { name: "keywords", content: "privacy policy, data protection, GDPR, CCPA, AI tool directory privacy, user data, cookies" },
      { property: "og:title", content: "Privacy Policy — AI Blaze" },
      { property: "og:description", content: "How we collect, use, and protect your data." },
      { property: "og:url", content: "https://aiblaze.io/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://aiblaze.io/privacy" }],
  }),
  component: () => (
    <LegalPage title="Privacy Policy" updated="June 4, 2026">
      <p>AI Blaze ("we", "us", "our") respects your privacy. This Privacy Policy explains what information we collect, how we use it, and your rights.</p>

      <h2>1. Information we collect</h2>
      <ul>
        <li><strong>Account data</strong> — email and authentication identifiers when you sign in.</li>
        <li><strong>Usage data</strong> — anonymized analytics about pages visited and features used.</li>
        <li><strong>Submitted content</strong> — bug reports, contact form messages, and any content you voluntarily submit.</li>
        <li><strong>Cookies</strong> — essential cookies for authentication and session management. See our <a href="/cookies">Cookie Policy</a>.</li>
      </ul>

      <h2>2. How we use your information</h2>
      <ul>
        <li>To operate, maintain, and improve AI Blaze.</li>
        <li>To respond to support requests and bug reports.</li>
        <li>To detect and prevent abuse.</li>
        <li>To comply with legal obligations.</li>
      </ul>

      <h2>3. Third-party services</h2>
      <p>We use the following providers to operate the service:</p>
      <ul>
        <li>Supabase — authentication and database hosting.</li>
        <li>Lovable Cloud — application hosting.</li>
        <li>Google Fonts — typography.</li>
      </ul>

      <h2>4. Your rights (GDPR / CCPA)</h2>
      <p>You have the right to access, correct, delete, or export your personal data, and to withdraw consent. To exercise these rights, email us at <a href="mailto:aiblaze.io@gmail.com">aiblaze.io@gmail.com</a>.</p>

      <h2>5. Data retention</h2>
      <p>We keep personal data only as long as needed to provide the service or comply with legal obligations. Bug reports and contact messages are retained for up to 24 months.</p>

      <h2>6. Children</h2>
      <p>AI Blaze is not directed at children under 13. We do not knowingly collect personal data from children.</p>

      <h2>7. Changes</h2>
      <p>We may update this policy. Material changes will be announced on the site. Continued use after changes means acceptance.</p>

      <h2>8. Contact</h2>
      <p>Questions? Email <a href="mailto:aiblaze.io@gmail.com">aiblaze.io@gmail.com</a>.</p>
    </LegalPage>
  ),
});
