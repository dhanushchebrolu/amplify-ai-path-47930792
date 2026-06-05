import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — AIBlaze" },
      { name: "description", content: "Terms of Service for AIBlaze — rules for using our AI tool directory, prompts library, and learning features." },
      { name: "keywords", content: "terms of service, user agreement, AI tool directory terms, AIBlaze legal" },
      { property: "og:title", content: "Terms of Service — AIBlaze" },
      { property: "og:description", content: "Rules for using AIBlaze." },
      { property: "og:url", content: "https://aiblaze.io/terms" },
    ],
    links: [{ rel: "canonical", href: "https://aiblaze.io/terms" }],
  }),
  component: () => (
    <LegalPage title="Terms of Service" updated="June 4, 2026">
      <p>By accessing or using AIBlaze, you agree to these Terms. If you don't agree, don't use the service.</p>

      <h2>1. The service</h2>
      <p>AIBlaze is an editorial directory of AI tools, prompts, tutorials, and related content. We may modify, suspend, or discontinue features at any time.</p>

      <h2>2. Accounts</h2>
      <p>You are responsible for your account credentials and all activity under your account. Notify us promptly of any unauthorized use.</p>

      <h2>3. Acceptable use</h2>
      <ul>
        <li>No scraping, crawling, or automated access without permission.</li>
        <li>No reverse engineering or circumventing security.</li>
        <li>No unlawful, defamatory, or infringing content.</li>
        <li>No spam or abuse of bug-report / contact channels.</li>
      </ul>

      <h2>4. Third-party tools</h2>
      <p>AIBlaze links to and describes third-party AI tools. We are not affiliated with most listed tools and are not responsible for their availability, accuracy, or content. Use of any third-party tool is governed by that tool's own terms.</p>

      <h2>5. Intellectual property</h2>
      <p>AIBlaze branding, copy, layout, and curated organization are owned by us. Tool names, logos, and trademarks belong to their respective owners.</p>

      <h2>6. Disclaimer</h2>
      <p>The service is provided "as is" without warranties of any kind. See our <a href="/disclaimer">Disclaimer</a>.</p>

      <h2>7. Limitation of liability</h2>
      <p>To the maximum extent permitted by law, AIBlaze and its operators are not liable for indirect, incidental, special, or consequential damages arising from use of the service.</p>

      <h2>8. Termination</h2>
      <p>We may suspend or terminate access for violations of these Terms.</p>

      <h2>9. Governing law</h2>
      <p>These Terms are governed by the laws of the United States, without regard to conflict-of-law principles.</p>

      <h2>10. Contact</h2>
      <p>Email <a href="mailto:aiblaze.io@gmail.com">aiblaze.io@gmail.com</a>.</p>
    </LegalPage>
  ),
});
