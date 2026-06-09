import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/affiliate-disclosure")({
  head: () => ({
    meta: [
      { title: "Affiliate Disclosure — AI Blaze" },
      { name: "description", content: "AI Blaze affiliate, sponsored content, and editorial independence disclosures. How we make money and why our recommendations stay unbiased." },
      { name: "keywords", content: "affiliate disclosure, sponsored content, editorial independence, AI Blaze" },
      { property: "og:title", content: "Affiliate Disclosure — AI Blaze" },
      { property: "og:description", content: "How AI Blaze earns affiliate commissions while keeping editorial independence." },
      { property: "og:url", content: "https://aiblaze.io/affiliate-disclosure" },
    ],
    links: [{ rel: "canonical", href: "https://aiblaze.io/affiliate-disclosure" }],
  }),
  component: () => (
    <LegalPage title="Affiliate Disclosure" updated="June 7, 2026">
      <h2>Affiliate relationships</h2>
      <p>AI Blaze participates in affiliate programs with some of the AI tools, products, and services we feature. When you click certain outbound links on AI Blaze and sign up for or purchase a product, we may earn a commission from the provider.</p>

      <h2>Sponsored content</h2>
      <p>From time to time, we may publish sponsored placements, featured listings, or promoted tools. Any sponsored or paid placement will be clearly labeled as such (for example, "Sponsored", "Promoted", or "Featured partner"). Unlabeled content is not sponsored.</p>

      <h2>No additional cost to you</h2>
      <p>Affiliate commissions are paid by the provider, not by you. Using an affiliate link on AI Blaze never increases the price you pay, and in many cases gives you access to the same free trials, discounts, or plans available directly on the provider's site.</p>

      <h2>Editorial independence</h2>
      <p>Our rankings, reviews, comparisons, and recommendations are based on independent research, hands-on testing, and user feedback. Affiliate relationships and sponsorships do <strong>not</strong> influence which tools we feature, how we rank them, or what we say about them. We routinely recommend tools we have no commercial relationship with, and we will call out weaknesses of partner tools when relevant.</p>

      <h2>How we use commissions</h2>
      <p>Affiliate revenue helps fund the ongoing research, testing, hosting, and editorial work that keeps AI Blaze free for readers.</p>

      <h2>Questions</h2>
      <p>If you have questions about a specific recommendation or our affiliate relationships, email <a href="mailto:aiblaze.io@gmail.com">aiblaze.io@gmail.com</a>.</p>
    </LegalPage>
  ),
});
