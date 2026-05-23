// Curated learning tasks for the gamified "Learn New" experience.
// Each task references a known tool (with website) plus a ready-to-paste prompt
// and a reference output (image) so users can try it in one click.

export interface LearnTask {
  id: string;
  title: string;
  tagline: string;
  category: "Image" | "Writing" | "Video" | "Coding" | "Audio" | "Design" | "Productivity";
  difficulty: "Beginner" | "Intermediate" | "Pro";
  minutes: number;
  tool: { name: string; website: string };
  prompt: string;
  steps: string[];
  reference: { type: "image" | "video"; url: string; caption: string };
  cover: string; // square image for cards / spin sphere
}

const img = (seed: string, size = 800) => `https://picsum.photos/seed/${seed}/${size}/${size}`;
const ref = (seed: string) => `https://picsum.photos/seed/${seed}-ref/1200/800`;

export const learnTasks: LearnTask[] = [
  {
    id: "midjourney-cinematic-portrait",
    title: "Cinematic Portrait",
    tagline: "Shoot a moody, film-grain portrait with Midjourney.",
    category: "Image",
    difficulty: "Beginner",
    minutes: 5,
    tool: { name: "Midjourney", website: "https://www.midjourney.com" },
    prompt:
      "cinematic portrait of a young woman wearing a navy wool coat, soft rim light, 35mm film grain, shallow depth of field, moody overcast Paris street, kodak portra 400 --ar 4:5 --style raw --v 6",
    steps: [
      "Open Midjourney and start a new prompt with /imagine.",
      "Paste the prompt exactly — the --ar and --style flags matter.",
      "Upscale your favorite of the 4 grid variants.",
      "Try swapping 'Paris' for another city for a fresh look.",
    ],
    reference: { type: "image", url: ref("midjourney"), caption: "Reference: moody cinematic portrait, 4:5 aspect." },
    cover: img("midjourney"),
  },
  {
    id: "chatgpt-cold-email",
    title: "Cold Email That Lands",
    tagline: "Write a high-reply cold email in under 2 minutes.",
    category: "Writing",
    difficulty: "Beginner",
    minutes: 3,
    tool: { name: "ChatGPT", website: "https://chat.openai.com" },
    prompt:
      "You are a senior B2B copywriter. Write a 90-word cold email from a {founder of a Series A AI analytics startup} to a {VP of Data at a mid-market SaaS company}. Use the PAS framework, one specific compliment based on their recent blog post, one concrete metric, and a soft CTA (15-min chat next week). Output subject line + body. No emojis.",
    steps: [
      "Open ChatGPT (GPT-4 or higher recommended).",
      "Paste the prompt, then replace the {bracketed} parts with your context.",
      "Ask for 3 subject line variants and pick the most specific.",
      "Personalize the compliment line manually — never ship it raw.",
    ],
    reference: { type: "image", url: ref("chatgpt-email"), caption: "Reference: PAS-framework cold email structure." },
    cover: img("chatgpt-email"),
  },
  {
    id: "runway-product-spin",
    title: "360° Product Spin",
    tagline: "Turn a single product photo into a smooth orbit video.",
    category: "Video",
    difficulty: "Intermediate",
    minutes: 7,
    tool: { name: "Runway", website: "https://runwayml.com" },
    prompt:
      "Smooth 360-degree orbit around the product on a soft cyclorama, locked tripod feel, gentle rim light rotating with camera, studio backdrop, 5 second loop, no warping.",
    steps: [
      "Open Runway → Gen-3 → Image to Video.",
      "Upload a clean, centered product photo on a plain background.",
      "Paste the prompt as motion description and set duration to 5s.",
      "Render at 1080p and export as MP4.",
    ],
    reference: { type: "image", url: ref("runway"), caption: "Reference: 5-second orbit on neutral cyc." },
    cover: img("runway"),
  },
  {
    id: "cursor-refactor",
    title: "Refactor a Messy Function",
    tagline: "Let Cursor clean up legacy code without breaking it.",
    category: "Coding",
    difficulty: "Intermediate",
    minutes: 6,
    tool: { name: "Cursor", website: "https://cursor.sh" },
    prompt:
      "Refactor the selected function for readability: extract pure helpers, replace nested ternaries with early returns, add a single-line JSDoc per function, and keep the public signature identical. Do NOT change behavior. After the diff, list every behavioral assumption you made.",
    steps: [
      "Open a messy file in Cursor and select the function.",
      "Press Cmd/Ctrl+K and paste the prompt.",
      "Review the diff — accept hunk-by-hunk, not all at once.",
      "Run your test suite before committing.",
    ],
    reference: { type: "image", url: ref("cursor"), caption: "Reference: side-by-side diff with extracted helpers." },
    cover: img("cursor"),
  },
  {
    id: "elevenlabs-voiceover",
    title: "Studio Voiceover in 60s",
    tagline: "Generate a broadcast-quality voiceover for a 30s ad.",
    category: "Audio",
    difficulty: "Beginner",
    minutes: 4,
    tool: { name: "ElevenLabs", website: "https://elevenlabs.io" },
    prompt:
      "Voice: warm, mid-30s, conversational documentary tone.\nScript: 'Most teams pick a CRM in a week and regret it for years. We built ours the opposite way — slow, opinionated, and obsessed with one job: closing more deals. Try it free for 14 days.'",
    steps: [
      "Open ElevenLabs → Speech Synthesis.",
      "Choose 'Adam' or 'Rachel' as the base voice.",
      "Paste the script. Lower Stability to 35%, raise Style to 40%.",
      "Generate, then export as 48kHz WAV.",
    ],
    reference: { type: "image", url: ref("elevenlabs"), caption: "Reference: voice settings + waveform preview." },
    cover: img("elevenlabs"),
  },
  {
    id: "figma-ai-wireframe",
    title: "Wireframe a Landing Page",
    tagline: "Spin up a full landing wireframe from one sentence.",
    category: "Design",
    difficulty: "Beginner",
    minutes: 5,
    tool: { name: "Figma", website: "https://www.figma.com" },
    prompt:
      "Generate a low-fidelity landing page wireframe for an AI-powered habit tracker called 'Loop'. Sections: sticky nav, hero with email capture, 3 feature highlights with icons, 1 testimonial, pricing (3 tiers), FAQ, footer. Mobile-first.",
    steps: [
      "Open Figma → install the 'Wireframe Designer' AI plugin.",
      "Run the plugin and paste the prompt.",
      "Drop the generated frames into a new page named 'v0'.",
      "Use Figma AI 'Make Designs' to upgrade a single section to high-fi.",
    ],
    reference: { type: "image", url: ref("figma"), caption: "Reference: 7-section wireframe, mobile-first stack." },
    cover: img("figma"),
  },
  {
    id: "notion-second-brain",
    title: "Auto-Summarize Your Week",
    tagline: "Let Notion AI write your weekly review from raw notes.",
    category: "Productivity",
    difficulty: "Beginner",
    minutes: 3,
    tool: { name: "Notion AI", website: "https://www.notion.so/product/ai" },
    prompt:
      "From the notes on this page, generate a weekly review with: 3 wins, 3 problems, 1 lesson, and a prioritized list of next week's top 5 tasks. Be ruthless — cut filler. Use crisp, declarative bullets.",
    steps: [
      "Open a Notion page that contains your week's raw notes.",
      "Type /ai → 'Custom AI block' and paste the prompt.",
      "Pin the resulting block to the top of the page.",
      "Re-run it every Friday — it inherits the latest notes automatically.",
    ],
    reference: { type: "image", url: ref("notion"), caption: "Reference: wins / problems / next-5 layout." },
    cover: img("notion"),
  },
  {
    id: "perplexity-deep-research",
    title: "Deep-Research a Competitor",
    tagline: "Get a sourced competitive teardown in 4 minutes.",
    category: "Writing",
    difficulty: "Intermediate",
    minutes: 4,
    tool: { name: "Perplexity", website: "https://www.perplexity.ai" },
    prompt:
      "Act as a senior competitive analyst. Research {competitor name} and produce: (1) one-paragraph positioning summary, (2) pricing table with sources, (3) 5 product strengths and 5 weaknesses (each with a source link), (4) top 3 customer complaints from G2/Reddit in the last 6 months. Cite every claim.",
    steps: [
      "Open Perplexity and switch to Pro Search.",
      "Paste the prompt and replace {competitor name}.",
      "Click each source pill to verify before you copy anything.",
      "Export to Markdown and paste into your competitive doc.",
    ],
    reference: { type: "image", url: ref("perplexity"), caption: "Reference: cited teardown with pricing table." },
    cover: img("perplexity"),
  },
  {
    id: "suno-jingle",
    title: "30-Second Brand Jingle",
    tagline: "Compose a custom jingle with vocals using Suno.",
    category: "Audio",
    difficulty: "Beginner",
    minutes: 4,
    tool: { name: "Suno", website: "https://suno.com" },
    prompt:
      "Style: upbeat indie-pop, 110 BPM, female lead vocal, claps, warm synth bass.\nLyrics:\n[Verse] Coffee in, ideas out, mornings move at lightspeed now\n[Chorus] Loop it up, let it run, this is how the work gets done",
    steps: [
      "Open Suno → Create.",
      "Toggle 'Custom Mode' on.",
      "Paste the Style line into Style, lyrics into Lyrics.",
      "Generate two variants, pick the better hook, then extend to 30s.",
    ],
    reference: { type: "image", url: ref("suno"), caption: "Reference: Suno custom-mode settings + waveform." },
    cover: img("suno"),
  },
  {
    id: "v0-component",
    title: "Ship a UI Component",
    tagline: "From sketch to production React in 5 minutes with v0.",
    category: "Coding",
    difficulty: "Beginner",
    minutes: 5,
    tool: { name: "v0 by Vercel", website: "https://v0.dev" },
    prompt:
      "Build a pricing card with: bold tier name, large price, monthly/annual toggle, 6 features with checkmarks, primary CTA, and a 'Most popular' ribbon variant. Use Tailwind, shadcn/ui, fully responsive, accessible (proper aria), and dark-mode aware. Output one file.",
    steps: [
      "Open v0.dev and start a new generation.",
      "Paste the prompt. Iterate by clicking parts of the preview.",
      "Hit 'Add to Codebase' and copy the shadcn install command.",
      "Drop the file into src/components/ and import where needed.",
    ],
    reference: { type: "image", url: ref("v0"), caption: "Reference: responsive pricing card, popular variant." },
    cover: img("v0"),
  },
  {
    id: "dalle-icon-set",
    title: "Matching App Icon Set",
    tagline: "Generate a cohesive 6-icon set with DALL·E 3.",
    category: "Design",
    difficulty: "Intermediate",
    minutes: 6,
    tool: { name: "DALL·E 3", website: "https://openai.com/dall-e-3" },
    prompt:
      "A set of 6 flat vector app icons in a single image, 2 rows by 3 cols, on a neutral background. Subjects: rocket, leaf, lightbulb, lock, chart, chat bubble. Style: soft gradients (lavender→peach), thick rounded strokes, single accent dot, consistent stroke weight, no text. Studio-grade, dribbble quality.",
    steps: [
      "Open ChatGPT (Plus) and select the DALL·E tool.",
      "Paste the prompt as-is.",
      "Ask: 'regenerate with the same palette but swap the rocket for a star.'",
      "Download the PNG and slice in Figma if you need individual icons.",
    ],
    reference: { type: "image", url: ref("dalle"), caption: "Reference: cohesive 6-icon grid, single palette." },
    cover: img("dalle"),
  },
  {
    id: "gamma-pitch-deck",
    title: "10-Slide Pitch Deck",
    tagline: "Generate an investor-ready deck from a single paragraph.",
    category: "Productivity",
    difficulty: "Beginner",
    minutes: 5,
    tool: { name: "Gamma", website: "https://gamma.app" },
    prompt:
      "Create a 10-slide seed-stage pitch deck for {startup name}, an AI {what it does} for {who it serves}. Cover: problem, insight, solution, demo, market, business model, traction, competition, team, ask. Tone: confident, founder voice, no buzzwords. 1 strong stat per slide.",
    steps: [
      "Open Gamma → 'Generate'.",
      "Paste the prompt and fill in the {brackets}.",
      "Pick a minimal, high-contrast theme (avoid the default).",
      "Replace stock images on the team slide with real headshots before sharing.",
    ],
    reference: { type: "image", url: ref("gamma"), caption: "Reference: 10-slide YC-style structure." },
    cover: img("gamma"),
  },
];

export function getTask(id: string) {
  return learnTasks.find((t) => t.id === id);
}

export function randomTaskId(excludeId?: string) {
  const pool = excludeId ? learnTasks.filter((t) => t.id !== excludeId) : learnTasks;
  return pool[Math.floor(Math.random() * pool.length)].id;
}
