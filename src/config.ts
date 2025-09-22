import { MAGIC_HOUR_TOOLS } from './server/lib/magic-hour';

export const createPrompts = [
  {
    id: 'flowchart-customer-onboarding',
    label: 'Onboarding Flowchart',
    prompt:
      'Clean process flowchart of a customer onboarding journey, 5 steps, minimal design.',
  },
  {
    id: 'process-flow',
    label: 'Process Flow',
    prompt:
      'Create a process flow diagram that illustrates the key stages involved in baking bread. Use colors and clear labels and a logical left-to-right or top-down flow. Include high-level steps only: mixing, kneading, proofing, baking, and use a minimal, business-style visual aesthetic. Dont put a title to the graphic.',
  },
  {
    id: '3d-render',
    label: '3D Render',
    prompt:
      'Create a modern 3D rendered object with clean geometry, professional lighting, and realistic materials. Studio lighting setup.',
  },
  {
    id: 'illustration',
    label: 'Digital Art',
    prompt:
      'Create a digital illustration with vibrant colors, artistic style, and creative composition. Modern digital art aesthetic.',
  },
];

export const editPrompts = [
  {
    id: 'add-text-pill',
    label: 'Add Text Badge',
    prompt:
      'Add a modern text pill or badge overlay to this image. The text should be contained in a rounded rectangle with a clean design, positioned prominently. The text should be "Watch This!"',
  },
  {
    id: 'remove-background',
    label: 'Remove Background',
    prompt:
      'Remove the background of this image while keeping the main subject intact.',
  },
  {
    id: 'change-background',
    label: 'Change Background',
    prompt:
      'Replace the background of this image with a new, more suitable background of the sea while keeping the main subject intact.',
  },
  {
    id: '3d-pixar-style',
    label: '3D Pixar Style',
    prompt:
      'Transform this image into a 3D Pixar style image. Make it look like a Pixar movie.',
  },
];

export interface Tool {
  id: string;
  name: string;
  description: string;
  credits: number;
  parameters: Record<string, unknown>;
  thumbnail: string;
  isNew: boolean;
}

// Tool descriptions mapping
const toolDescriptions: Record<string, string> = {
  'ai-image-generator': 'Create AI images with various styles and tools',
  'ai-gif-creator': 'Generate animated GIFs from text prompts',
  'ai-headshot-generator': 'Generate professional headshots from selfies',
  'ai-meme-generator': 'Create memes with AI assistance',
  'image-background-remover': 'Remove or replace image backgrounds',
  'face-swap-photo': 'Swap faces in photos with AI',
  'ai-clothes-changer': 'Change outfits in photos using AI',
};

// Transform Magic Hour tools to Tool interface format
const magicHourTools: Tool[] = Object.entries(MAGIC_HOUR_TOOLS).map(
  ([id, config]) => ({
    id,
    name: config.name,
    description: toolDescriptions[id] || 'Advanced AI-powered tool',
    credits: config.credits,
    parameters: config.parameters as Record<string, unknown>,
    thumbnail: `https://d28dkohlqf5vwj.cloudfront.net/projects/ai-image-generator-landing-page.webp`, // Placeholder thumbnail path
    // eslint-disable-next-line no-unneeded-ternary
    isNew: id === 'ai-image-generator' ? false : true,
  })
);

// Gemini AI Image Editor tool configuration
const geminiImageEditorTool: Tool = {
  id: 'gemini-ai-image-editor',
  name: 'AI Image Editor',
  description: 'Edit and transform images using AI',
  credits: 1, // Using 1 credit for Gemini calls, matching manager.ts
  parameters: {
    prompt: { type: 'string', required: true },
    referenceImage: { type: 'string', required: false },
    temperature: { type: 'number', min: 0, max: 2, default: 0.7 },
  },
  thumbnail: 'https://getstyled.art/icons/logo_v2_96.webp',
  isNew: false,
};

// Export all available tools
export const availableTools: Tool[] = [
  // Gemini AI Image Editor (using existing Gemini integration)
  geminiImageEditorTool,
  // All Magic Hour tools
  ...magicHourTools,
];
