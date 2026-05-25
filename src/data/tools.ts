// Curated AI tools dataset. Logos use simpleicons.org CDN when a brand
// slug exists; otherwise we fall back to a styled letter monogram with the
// tool's brand color. Both look professional — no generic gradients.

export type Pricing = "Free" | "Freemium" | "Paid";

export interface Tool {
  slug: string;
  name: string;
  shortName?: string; // for bubble label
  category: string; // category slug
  tagline: string;
  description: string;
  pricing: Pricing;
  priceFrom?: string;
  website: string;
  features: string[];
  tags: string[];
  useCases: string[];
  pros: string[];
  cons: string[];
  rating: number;
  trending?: boolean;
  // Branding
  brandColor: string;       // hex
  simpleIcon?: string;      // simpleicons.org slug
  iconOnDark?: boolean;     // render icon in white instead of brand color
}

export interface Category {
  slug: string;
  name: string;
  short: string;            // "Writing & Content"
  description: string;
  blurb: string;            // longer SEO blurb
}

export const categories: Category[] = [
  {
    slug: "writing",
    name: "Writing",
    short: "Writing & Content",
    description: "Tools for writing, copywriting, SEO, and content creation",
    blurb:
      "From long-form blog drafting to SEO briefs and on-brand marketing copy, these AI writing assistants help teams ship content faster without losing voice.",
  },
  {
    slug: "video",
    name: "Video",
    short: "Video & Cinema",
    description: "AI video generation, editing, avatars, and post-production",
    blurb:
      "Generate cinematic clips, lip-sync avatars, edit footage with text prompts, and turn scripts into finished video in minutes.",
  },
  {
    slug: "audio",
    name: "Audio",
    short: "Audio & Voice",
    description: "Voice cloning, music generation, transcription, and audio cleanup",
    blurb:
      "Clone a voice in seconds, score a track from a prompt, transcribe meetings, and clean up noisy recordings — all powered by audio AI.",
  },
  {
    slug: "image",
    name: "Image",
    short: "Image & Design",
    description: "AI image generation, editing, upscaling, and design tools",
    blurb:
      "Generate brand-quality images, edit with prompts, design social posts, and produce assets at scale.",
  },
  {
    slug: "coding",
    name: "Coding",
    short: "Code & Dev",
    description: "AI coding assistants, IDE copilots, and autonomous agents",
    blurb:
      "Ship code faster with autocomplete, in-editor agents, and full-stack assistants that understand your repo.",
  },
  {
    slug: "productivity",
    name: "Productivity",
    short: "Productivity",
    description: "Meeting notes, search, knowledge bases, and AI workspaces",
    blurb:
      "Capture decisions, summarize meetings, search across apps, and turn your team's knowledge into an instantly queryable workspace.",
  },
];

export const tools: Tool[] = [
  // ───────── WRITING ─────────
  { slug: "chatgpt", name: "ChatGPT", category: "writing", tagline: "World's most popular AI assistant",
    description: "OpenAI's flagship assistant for writing, research, coding, and creative tasks. Strong reasoning, large context, native image and voice modes.",
    pricing: "Freemium", priceFrom: "Free / $20/mo", website: "https://chatgpt.com",
    features: ["GPT-5 reasoning", "Image generation", "Voice mode", "Custom GPTs", "Code interpreter"],
    tags: ["Assistant", "Blog Writing", "Copywriting"], useCases: ["Drafting blog posts", "Research summaries", "Email writing"],
    pros: ["Best-in-class reasoning", "Huge ecosystem"], cons: ["Free tier rate-limited"],
    rating: 4.8, trending: true, brandColor: "#10A37F" },

  { slug: "claude", name: "Claude", category: "writing", tagline: "Nuanced, thoughtful writing assistant",
    description: "Anthropic's assistant known for long-context reasoning, careful tone, and the best long-form writing quality in the industry.",
    pricing: "Freemium", priceFrom: "Free / $20/mo", website: "https://claude.ai",
    features: ["200k context", "Projects", "Artifacts", "Computer use"],
    tags: ["Assistant", "Blog Writing"], useCases: ["Long-form essays", "Document analysis", "Code review"],
    pros: ["Excellent prose", "Massive context window"], cons: ["Slower image features"],
    rating: 4.8, trending: true, brandColor: "#D97757", simpleIcon: "anthropic", iconOnDark: true },

  { slug: "gemini", name: "Gemini", category: "writing", tagline: "Google's multimodal assistant",
    description: "Google's assistant with deep web search, Workspace integration, and strong multimodal understanding across text, image, and video.",
    pricing: "Freemium", priceFrom: "Free / $20/mo", website: "https://gemini.google.com",
    features: ["Workspace integration", "Deep Research", "Live video"],
    tags: ["Assistant", "Research"], useCases: ["Research with citations", "Gmail drafting", "Docs editing"],
    pros: ["Tight Google integration", "Free tier is generous"], cons: ["Inconsistent across modes"],
    rating: 4.6, brandColor: "#4285F4", simpleIcon: "googlegemini" },

  { slug: "jasper", name: "Jasper", category: "writing", tagline: "Enterprise marketing content platform",
    description: "Brand-trained AI content platform for marketing teams. Campaign workflows, brand voice, and bulk content generation.",
    pricing: "Paid", priceFrom: "$49/mo", website: "https://jasper.ai",
    features: ["Brand voice", "Campaigns", "SEO mode", "Team workflows"],
    tags: ["Copywriting", "Marketing"], useCases: ["Ad copy at scale", "Email campaigns", "Brand-aligned content"],
    pros: ["Built for teams", "Brand voice training"], cons: ["No free tier"],
    rating: 4.4, brandColor: "#FF6B35" },

  { slug: "writesonic", name: "Writesonic", category: "writing", tagline: "SEO-optimized AI content at scale",
    description: "AI writer focused on SEO-ranking articles, ads, and product pages with built-in fact checking and SERP analysis.",
    pricing: "Freemium", priceFrom: "Free / $16/mo", website: "https://writesonic.com",
    features: ["SEO article writer", "Fact checking", "AI chat", "Bulk generation"],
    tags: ["SEO Writing", "Copywriting"], useCases: ["SEO blog posts", "Product descriptions"],
    pros: ["Great SEO workflow", "Affordable"], cons: ["Output needs editing"],
    rating: 4.3, brandColor: "#1A73E8" },

  { slug: "copy-ai", name: "Copy.ai", category: "writing", tagline: "GTM AI workflows for sales & marketing",
    description: "Workflow-driven AI for go-to-market teams — outbound emails, account research, content ops automation.",
    pricing: "Freemium", priceFrom: "Free / $49/mo", website: "https://copy.ai",
    features: ["GTM workflows", "Email sequences", "Account research"],
    tags: ["Copywriting", "Sales"], useCases: ["Cold outbound", "Sales enablement"],
    pros: ["Workflow automation"], cons: ["Heavier learning curve"],
    rating: 4.2, brandColor: "#3B82F6" },

  { slug: "grammarly", name: "Grammarly", category: "writing", tagline: "Grammar, clarity, and tone",
    description: "Trusted writing assistant for grammar, clarity, and tone — now with generative AI for rewriting and drafting.",
    pricing: "Freemium", priceFrom: "Free / $12/mo", website: "https://grammarly.com",
    features: ["Grammar checking", "Tone detection", "Generative rewrite"],
    tags: ["Grammar & Editing"], useCases: ["Email polish", "Document proofing"],
    pros: ["Works everywhere", "Trusted brand"], cons: ["Generative features limited"],
    rating: 4.6, brandColor: "#15C39A", simpleIcon: "grammarly" },

  { slug: "quillbot", name: "QuillBot", category: "writing", tagline: "AI paraphrasing & grammar checker",
    description: "Paraphrasing, summarization, citation, and grammar tools used by millions of students and writers.",
    pricing: "Freemium", priceFrom: "Free / $9.95/mo", website: "https://quillbot.com",
    features: ["Paraphraser", "Summarizer", "Citation generator"],
    tags: ["Grammar & Editing"], useCases: ["Rewriting essays", "Summarizing research"],
    pros: ["Excellent paraphraser"], cons: ["Limited free quota"],
    rating: 4.4, brandColor: "#8B5CF6" },

  { slug: "notion-ai", name: "Notion AI", category: "writing", tagline: "AI inside your workspace",
    description: "AI writing, summarization, and Q&A built directly into Notion docs, wikis, and databases.",
    pricing: "Paid", priceFrom: "$10/mo add-on", website: "https://notion.so/product/ai",
    features: ["In-doc writing", "Database autofill", "Workspace Q&A"],
    tags: ["Assistant", "Productivity"], useCases: ["Meeting notes", "Wiki search"],
    pros: ["Inside your docs"], cons: ["Requires Notion"],
    rating: 4.5, brandColor: "#FFFFFF", simpleIcon: "notion", iconOnDark: true },

  // ───────── VIDEO ─────────
  { slug: "runway", name: "Runway", category: "video", tagline: "Generative video studio",
    description: "Industry-leading text-to-video and video editing platform with Gen-4 model, motion brush, and pro editing tools.",
    pricing: "Freemium", priceFrom: "Free / $15/mo", website: "https://runwayml.com",
    features: ["Gen-4 video", "Motion brush", "Green screen AI", "Inpainting"],
    tags: ["Generation", "Editing"], useCases: ["Short films", "Ad creative", "B-roll generation"],
    pros: ["Cinematic output"], cons: ["Credits run out fast"],
    rating: 4.7, trending: true, brandColor: "#FFFFFF", iconOnDark: true },

  { slug: "sora", name: "Sora", category: "video", tagline: "OpenAI's text-to-video model",
    description: "OpenAI's flagship text-to-video model producing long, coherent, photorealistic clips from prompts.",
    pricing: "Paid", priceFrom: "Included in ChatGPT Pro", website: "https://openai.com/sora",
    features: ["Long-form generation", "Storyboard", "Remix"],
    tags: ["Generation"], useCases: ["Concept films", "Storyboarding"],
    pros: ["Best photorealism"], cons: ["Pro plan required"],
    rating: 4.6, brandColor: "#000000" },

  { slug: "pika", name: "Pika", category: "video", tagline: "Idea-to-video in seconds",
    description: "Fast, playful video generation with effects, lip sync, and character consistency.",
    pricing: "Freemium", priceFrom: "Free / $10/mo", website: "https://pika.art",
    features: ["Pikaffects", "Lip sync", "Scene ingredients"],
    tags: ["Generation"], useCases: ["Social clips", "Memes"],
    pros: ["Fast and fun"], cons: ["Shorter clips"],
    rating: 4.4, brandColor: "#A855F7" },

  { slug: "heygen", name: "HeyGen", category: "video", tagline: "AI avatars & video translation",
    description: "Create studio-quality avatar videos and translate any video into 175+ languages with lip sync.",
    pricing: "Freemium", priceFrom: "Free / $29/mo", website: "https://heygen.com",
    features: ["AI avatars", "Video translation", "Voice cloning"],
    tags: ["Avatars", "Translation"], useCases: ["Training videos", "Localized marketing"],
    pros: ["Top-tier avatars"], cons: ["Pricey at scale"],
    rating: 4.6, brandColor: "#3B82F6" },

  { slug: "luma", name: "Luma Dream Machine", category: "video", tagline: "Cinematic AI video",
    description: "Luma Labs' video model — fast, photorealistic, with strong camera motion controls.",
    pricing: "Freemium", priceFrom: "Free / $9.99/mo", website: "https://lumalabs.ai/dream-machine",
    features: ["Ray2 model", "Camera controls", "Image-to-video"],
    tags: ["Generation"], useCases: ["Ads", "Cinematic shots"],
    pros: ["Beautiful motion"], cons: ["Queue waits"],
    rating: 4.5, brandColor: "#EAB308" },

  { slug: "synthesia", name: "Synthesia", category: "video", tagline: "Enterprise AI video platform",
    description: "Create training and corporate videos with AI avatars in 140+ languages. Used by 60k+ companies.",
    pricing: "Paid", priceFrom: "$29/mo", website: "https://synthesia.io",
    features: ["140+ avatars", "Custom avatars", "Brand kits"],
    tags: ["Avatars", "Enterprise"], useCases: ["L&D videos", "Internal comms"],
    pros: ["Enterprise-grade"], cons: ["No free tier"],
    rating: 4.5, brandColor: "#6366F1" },

  { slug: "capcut", name: "CapCut", category: "video", tagline: "AI-powered video editor",
    description: "Free desktop and mobile editor with AI tools for auto-captions, background removal, and effects.",
    pricing: "Freemium", priceFrom: "Free", website: "https://capcut.com",
    features: ["Auto captions", "BG removal", "AI effects"],
    tags: ["Editing"], useCases: ["TikTok edits", "YouTube shorts"],
    pros: ["Powerful free tier"], cons: ["Watermark on some exports"],
    rating: 4.6, brandColor: "#000000", simpleIcon: "capcut", iconOnDark: true },

  { slug: "descript", name: "Descript", category: "video", tagline: "Edit video like a doc",
    description: "Edit podcasts and video by editing the transcript. AI voice cloning, overdub, and studio sound.",
    pricing: "Freemium", priceFrom: "Free / $19/mo", website: "https://descript.com",
    features: ["Transcript editing", "Overdub", "Studio sound"],
    tags: ["Editing", "Podcasting"], useCases: ["Podcast editing", "Remote interviews"],
    pros: ["Unique workflow"], cons: ["Learning curve"],
    rating: 4.5, brandColor: "#01D2A6", simpleIcon: "descript" },

  // ───────── AUDIO ─────────
  { slug: "elevenlabs", name: "ElevenLabs", category: "audio", tagline: "Best-in-class AI voices",
    description: "Hyper-realistic text-to-speech and voice cloning in 32 languages. The studio standard for AI voice.",
    pricing: "Freemium", priceFrom: "Free / $5/mo", website: "https://elevenlabs.io",
    features: ["Voice cloning", "Multilingual TTS", "Voice library", "API"],
    tags: ["TTS", "Voice Cloning"], useCases: ["Audiobooks", "Video narration", "IVR"],
    pros: ["Unmatched voice quality"], cons: ["Cost scales with usage"],
    rating: 4.8, trending: true, brandColor: "#FFFFFF", iconOnDark: true },

  { slug: "suno", name: "Suno", category: "audio", tagline: "Make any song you can imagine",
    description: "Prompt-to-song AI that generates full tracks with vocals, lyrics, and production in any genre.",
    pricing: "Freemium", priceFrom: "Free / $10/mo", website: "https://suno.com",
    features: ["Full songs", "Lyric editor", "Stem separation"],
    tags: ["Music"], useCases: ["Demos", "Background music", "Jingles"],
    pros: ["Genuinely listenable songs"], cons: ["Generic lyrics by default"],
    rating: 4.7, trending: true, brandColor: "#EC4899" },

  { slug: "udio", name: "Udio", category: "audio", tagline: "AI music generation",
    description: "Generate music with fine-grained control over genre, mood, and instrumentation. Strong for producers.",
    pricing: "Freemium", priceFrom: "Free / $10/mo", website: "https://udio.com",
    features: ["Genre control", "Extend tracks", "Remix"],
    tags: ["Music"], useCases: ["Producer demos", "Soundtracks"],
    pros: ["Producer-friendly controls"], cons: ["Smaller community"],
    rating: 4.5, brandColor: "#8B5CF6" },

  { slug: "murf", name: "Murf", category: "audio", tagline: "Studio-quality AI voiceovers",
    description: "120+ AI voices in 20+ languages for e-learning, marketing videos, and podcasts.",
    pricing: "Freemium", priceFrom: "Free / $19/mo", website: "https://murf.ai",
    features: ["120+ voices", "Voice changer", "Sync with video"],
    tags: ["TTS"], useCases: ["E-learning", "Explainer videos"],
    pros: ["Big voice library"], cons: ["Less natural than ElevenLabs"],
    rating: 4.4, brandColor: "#06B6D4" },

  { slug: "krisp", name: "Krisp", category: "audio", tagline: "AI noise & echo cancellation",
    description: "Removes background noise, echo, and voices from calls in real time. Works with any conferencing app.",
    pricing: "Freemium", priceFrom: "Free / $8/mo", website: "https://krisp.ai",
    features: ["Noise cancellation", "Meeting transcription", "Accent localization"],
    tags: ["Audio Cleanup"], useCases: ["Remote meetings", "Podcasting"],
    pros: ["Just works"], cons: ["Limited free minutes"],
    rating: 4.6, brandColor: "#22C55E" },

  { slug: "playht", name: "PlayHT", category: "audio", tagline: "Realistic AI voice generator",
    description: "Ultra-realistic text-to-speech with voice cloning, conversational voices, and a low-latency API.",
    pricing: "Freemium", priceFrom: "Free / $39/mo", website: "https://play.ht",
    features: ["Voice cloning", "Conversational voices", "Real-time API"],
    tags: ["TTS"], useCases: ["Voice agents", "Audiobook production"],
    pros: ["Low-latency API"], cons: ["Pricing complex"],
    rating: 4.4, brandColor: "#3B82F6" },

  // ───────── IMAGE ─────────
  { slug: "midjourney", name: "Midjourney", category: "image", tagline: "Most artistic AI image model",
    description: "Best-in-class image model known for its aesthetic. Now with a web app, image editor, and video output.",
    pricing: "Paid", priceFrom: "$10/mo", website: "https://midjourney.com",
    features: ["V7 model", "Image editor", "Style references", "Video"],
    tags: ["Generation", "Art"], useCases: ["Concept art", "Marketing visuals"],
    pros: ["Best aesthetic"], cons: ["No free tier"],
    rating: 4.8, trending: true, brandColor: "#FFFFFF", iconOnDark: true },

  { slug: "dalle", name: "DALL·E 3", category: "image", tagline: "OpenAI's image model",
    description: "OpenAI's image generator, integrated into ChatGPT. Strong text rendering and prompt accuracy.",
    pricing: "Freemium", priceFrom: "Included with ChatGPT", website: "https://openai.com/dall-e-3",
    features: ["Text-in-image", "ChatGPT integration", "Conversational editing"],
    tags: ["Generation"], useCases: ["Quick visuals", "Slide graphics"],
    pros: ["Inside ChatGPT"], cons: ["Less artistic than MJ"],
    rating: 4.5, brandColor: "#10A37F" },

  { slug: "flux", name: "Flux", category: "image", tagline: "Open-weights image model from Black Forest Labs",
    description: "State-of-the-art open-weights image model with excellent prompt adherence and photorealism.",
    pricing: "Freemium", priceFrom: "Free on many hosts", website: "https://blackforestlabs.ai",
    features: ["Open weights", "Photorealism", "Fast inference"],
    tags: ["Generation", "Open Source"], useCases: ["Self-hosted gen", "App integrations"],
    pros: ["Open weights", "Fast"], cons: ["No first-party UI"],
    rating: 4.5, brandColor: "#22C55E" },

  { slug: "leonardo", name: "Leonardo AI", category: "image", tagline: "Production-ready creative suite",
    description: "Image generation with fine-tuning, model training, real-time canvas, and game-asset workflows.",
    pricing: "Freemium", priceFrom: "Free / $12/mo", website: "https://leonardo.ai",
    features: ["Model training", "Real-time canvas", "3D textures"],
    tags: ["Generation", "Game Assets"], useCases: ["Game art", "Brand assets"],
    pros: ["Powerful creative suite"], cons: ["Many features to learn"],
    rating: 4.5, brandColor: "#EF4444" },

  { slug: "firefly", name: "Adobe Firefly", category: "image", tagline: "Commercially safe AI from Adobe",
    description: "Adobe's image, vector, and video AI — trained on licensed content and integrated into Creative Cloud.",
    pricing: "Freemium", priceFrom: "Free / $4.99/mo", website: "https://firefly.adobe.com",
    features: ["Generative Fill", "Vector recolor", "Photoshop integration"],
    tags: ["Generation", "Editing"], useCases: ["Photoshop workflows", "Commercial-safe assets"],
    pros: ["Commercial safety", "Adobe integration"], cons: ["Aesthetic less striking"],
    rating: 4.4, brandColor: "#FA0F00" },

  { slug: "canva", name: "Canva Magic Studio", category: "image", tagline: "AI design for everyone",
    description: "Canva's AI suite — Magic Design, Magic Write, image generation, and translation built into the editor.",
    pricing: "Freemium", priceFrom: "Free / $14.99/mo", website: "https://canva.com",
    features: ["Magic Design", "Magic Write", "Background remover"],
    tags: ["Design"], useCases: ["Social posts", "Presentations"],
    pros: ["Easiest to use"], cons: ["Less control"],
    rating: 4.6, brandColor: "#00C4CC" },

  { slug: "ideogram", name: "Ideogram", category: "image", tagline: "Best AI for text in images",
    description: "Image generator with the best typography rendering — perfect for posters, logos, and ads with real text.",
    pricing: "Freemium", priceFrom: "Free / $8/mo", website: "https://ideogram.ai",
    features: ["Accurate text rendering", "Magic Prompt", "Remix"],
    tags: ["Generation", "Typography"], useCases: ["Posters", "Logos", "Ad creative"],
    pros: ["Unmatched text accuracy"], cons: ["Less artistic range"],
    rating: 4.5, brandColor: "#F59E0B" },

  // ───────── CODING ─────────
  { slug: "cursor", name: "Cursor", category: "coding", tagline: "The AI code editor",
    description: "VS Code fork built around AI — composer mode, agent edits across files, and best-in-class autocomplete.",
    pricing: "Freemium", priceFrom: "Free / $20/mo", website: "https://cursor.com",
    features: ["Composer agent", "Codebase Q&A", "Tab autocomplete"],
    tags: ["IDE", "Agent"], useCases: ["Daily development", "Refactoring", "New features"],
    pros: ["Multi-file agent edits"], cons: ["Costs add up on Pro"],
    rating: 4.8, trending: true, brandColor: "#FFFFFF", iconOnDark: true },

  { slug: "github-copilot", name: "GitHub Copilot", category: "coding", tagline: "AI pair programmer",
    description: "GitHub's AI assistant inside VS Code, JetBrains, and Visual Studio. Now with agent mode and chat.",
    pricing: "Freemium", priceFrom: "Free / $10/mo", website: "https://github.com/features/copilot",
    features: ["Autocomplete", "Chat", "Agent mode", "PR reviews"],
    tags: ["IDE", "Assistant"], useCases: ["Daily coding", "PR reviews"],
    pros: ["Works everywhere"], cons: ["Less aggressive than Cursor"],
    rating: 4.6, brandColor: "#FFFFFF", simpleIcon: "github", iconOnDark: true },

  { slug: "lovable", name: "Lovable", category: "coding", tagline: "Build full apps by chatting",
    description: "AI app builder that ships production React apps from a chat. Supabase, auth, and deployment built in.",
    pricing: "Freemium", priceFrom: "Free / $25/mo", website: "https://lovable.dev",
    features: ["Full-stack generation", "Supabase integration", "1-click deploy"],
    tags: ["No-code", "Full Stack"], useCases: ["MVPs", "Internal tools", "Landing pages"],
    pros: ["Ships real apps fast"], cons: ["Best for greenfield"],
    rating: 4.7, trending: true, brandColor: "#FF4D8D" },

  { slug: "v0", name: "v0", category: "coding", tagline: "Vercel's UI generator",
    description: "Generate React + Tailwind + shadcn UI from prompts and screenshots. Ships clean, idiomatic code.",
    pricing: "Freemium", priceFrom: "Free / $20/mo", website: "https://v0.dev",
    features: ["UI generation", "Screenshot to code", "Shadcn output"],
    tags: ["UI", "Frontend"], useCases: ["Component scaffolding", "Landing UI"],
    pros: ["Clean output"], cons: ["UI-focused only"],
    rating: 4.5, brandColor: "#FFFFFF", simpleIcon: "vercel", iconOnDark: true },

  { slug: "claude-code", name: "Claude Code", category: "coding", tagline: "Anthropic's terminal coding agent",
    description: "Anthropic's CLI coding agent — strong on large codebases, careful edits, and long-horizon tasks.",
    pricing: "Paid", priceFrom: "Included with Claude Pro", website: "https://anthropic.com/claude-code",
    features: ["Terminal agent", "MCP tools", "Long-context edits"],
    tags: ["Agent", "CLI"], useCases: ["Repo-wide refactors", "Background tasks"],
    pros: ["Excellent on real codebases"], cons: ["CLI-only"],
    rating: 4.7, brandColor: "#D97757", simpleIcon: "anthropic", iconOnDark: true },

  // ───────── PRODUCTIVITY ─────────
  { slug: "notion", name: "Notion", category: "productivity", tagline: "Your team's connected workspace",
    description: "Docs, wikis, projects, and databases — now with AI search, summarization, and writing built-in.",
    pricing: "Freemium", priceFrom: "Free / $10/mo", website: "https://notion.so",
    features: ["Docs & wikis", "Databases", "AI Q&A"],
    tags: ["Workspace"], useCases: ["Team wikis", "Project tracking"],
    pros: ["All-in-one"], cons: ["Can get messy at scale"],
    rating: 4.6, brandColor: "#FFFFFF", simpleIcon: "notion", iconOnDark: true },

  { slug: "perplexity", name: "Perplexity", category: "productivity", tagline: "Answer engine with sources",
    description: "Conversational search that cites its sources. Pro plan unlocks GPT-5, Claude, and Sonar deep research.",
    pricing: "Freemium", priceFrom: "Free / $20/mo", website: "https://perplexity.ai",
    features: ["Cited answers", "Deep Research", "Spaces"],
    tags: ["Search", "Research"], useCases: ["Research", "Fact-finding"],
    pros: ["Sources you can trust"], cons: ["Quality varies on niche topics"],
    rating: 4.7, trending: true, brandColor: "#1FB8CD" },

  { slug: "granola", name: "Granola", category: "productivity", tagline: "AI notepad for meetings",
    description: "Takes notes during your meetings without a bot joining the call. Enhances your shorthand into clean notes.",
    pricing: "Freemium", priceFrom: "Free / $18/mo", website: "https://granola.ai",
    features: ["Local audio capture", "Templates", "Folder organization"],
    tags: ["Meetings", "Notes"], useCases: ["Sales calls", "1:1s"],
    pros: ["No bot in call"], cons: ["Mac-only currently"],
    rating: 4.7, brandColor: "#F97316" },

  { slug: "raycast", name: "Raycast", category: "productivity", tagline: "Spotlight, supercharged with AI",
    description: "Mac productivity launcher with AI chat, quick commands, and an extension ecosystem.",
    pricing: "Freemium", priceFrom: "Free / $8/mo", website: "https://raycast.com",
    features: ["AI chat", "Quick AI", "Extensions"],
    tags: ["Launcher", "Mac"], useCases: ["Quick AI queries", "Workflow automation"],
    pros: ["Lightning fast"], cons: ["Mac-only"],
    rating: 4.8, brandColor: "#FF6363", simpleIcon: "raycast", iconOnDark: true },

  { slug: "fathom", name: "Fathom", category: "productivity", tagline: "AI meeting recorder & summarizer",
    description: "Free meeting recorder that summarizes Zoom, Meet, and Teams calls and syncs to your CRM.",
    pricing: "Freemium", priceFrom: "Free / $19/mo", website: "https://fathom.video",
    features: ["Auto-summaries", "CRM sync", "AI action items"],
    tags: ["Meetings"], useCases: ["Sales calls", "Customer interviews"],
    pros: ["Generous free tier"], cons: ["Requires bot to join"],
    rating: 4.6, brandColor: "#6366F1" },
];

export function toolsByCategory(slug: string): Tool[] {
  return tools.filter((t) => t.category === slug);
}
export function getTool(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}
export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
export function trendingTools(): Tool[] {
  return tools.filter((t) => t.trending);
}
