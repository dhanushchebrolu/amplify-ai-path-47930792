import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/dmca")({
  head: () => ({
    meta: [
      { title: "DMCA Policy — NeuroHub" },
      { name: "description", content: "Copyright takedown procedure under the Digital Millennium Copyright Act for NeuroHub." },
      { name: "keywords", content: "DMCA, copyright takedown, intellectual property, NeuroHub" },
      { property: "og:title", content: "DMCA Policy — NeuroHub" },
      { property: "og:description", content: "Copyright takedown procedure." },
      { property: "og:url", content: "https://amplify-ai-path.lovable.app/dmca" },
    ],
    links: [{ rel: "canonical", href: "https://amplify-ai-path.lovable.app/dmca" }],
  }),
  component: () => (
    <LegalPage title="DMCA Policy" updated="June 4, 2026">
      <p>NeuroHub respects the intellectual property rights of others and complies with the Digital Millennium Copyright Act (DMCA).</p>

      <h2>Submitting a takedown notice</h2>
      <p>If you believe content on NeuroHub infringes your copyright, send a written notice to <a href="mailto:aiblaze.io@gmail.com">aiblaze.io@gmail.com</a> including:</p>
      <ul>
        <li>Your physical or electronic signature.</li>
        <li>Identification of the copyrighted work claimed to be infringed.</li>
        <li>The URL or location of the allegedly infringing material on NeuroHub.</li>
        <li>Your contact information (address, phone, email).</li>
        <li>A statement that you have a good-faith belief the use is not authorized.</li>
        <li>A statement, under penalty of perjury, that the information is accurate and you are authorized to act on behalf of the copyright owner.</li>
      </ul>

      <h2>Counter-notice</h2>
      <p>If your content was removed and you believe it was a mistake, you may send a counter-notice with the same elements above plus consent to jurisdiction.</p>

      <h2>Repeat infringers</h2>
      <p>Accounts that repeatedly infringe copyrights will be terminated.</p>
    </LegalPage>
  ),
});
