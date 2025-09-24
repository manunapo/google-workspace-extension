import { MAGIC_HOUR_TOOLS } from './server/lib/magic-hour';

export interface Prompt {
  id: string;
  label: string;
  prompt: string;
}

export const createPrompts: Prompt[] = [
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

export const editPrompts: Prompt[] = [
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

export const gifPrompts: Prompt[] = [
  {
    id: 'dancing-character',
    label: 'Dancing Character',
    prompt:
      'A cute animated character dancing joyfully with smooth, bouncy movements and vibrant colors.',
  },
  {
    id: 'floating-objects',
    label: 'Floating Objects',
    prompt:
      'Various colorful objects gently floating and rotating in a dreamy, weightless environment.',
  },
  {
    id: 'nature-loop',
    label: 'Nature Scene',
    prompt:
      'A serene nature scene with flowing water, swaying trees, and moving clouds in a seamless loop.',
  },
  {
    id: 'tech-animation',
    label: 'Tech Animation',
    prompt:
      'Futuristic technology interface with glowing elements, data streams, and smooth transitions.',
  },
];

export const headshotPrompts: Prompt[] = [
  {
    id: 'professional-business',
    label: 'Professional Business',
    prompt:
      'Professional business headshot with formal attire, clean background, and confident expression.',
  },
  {
    id: 'creative-professional',
    label: 'Creative Professional',
    prompt:
      'Creative professional headshot with artistic flair, modern styling, and approachable expression.',
  },
  {
    id: 'corporate-executive',
    label: 'Corporate Executive',
    prompt:
      'Corporate executive headshot with premium suit, sophisticated lighting, and authoritative presence.',
  },
  {
    id: 'linkedin-profile',
    label: 'LinkedIn Profile',
    prompt:
      'LinkedIn-ready professional headshot with clean background, business casual attire, and friendly smile.',
  },
];

export const memePrompts: Prompt[] = [
  {
    id: 'workplace-humor',
    label: 'Workplace Humor',
    prompt: 'Funny workplace situations and office life',
  },
  {
    id: 'tech-memes',
    label: 'Tech Memes',
    prompt: 'Programming, coding, and technology humor',
  },
  {
    id: 'social-media',
    label: 'Social Media',
    prompt: 'Social media trends and internet culture',
  },
  {
    id: 'daily-life',
    label: 'Daily Life',
    prompt: 'Relatable everyday situations and experiences',
  },
];

export const backgroundPrompts: Prompt[] = [
  {
    id: 'studio-background',
    label: 'Studio Background',
    prompt:
      'Replace with a professional studio background with clean, neutral colors and professional lighting.',
  },
  {
    id: 'nature-background',
    label: 'Nature Background',
    prompt:
      'Replace with a beautiful nature background featuring mountains, forests, or scenic landscapes.',
  },
  {
    id: 'office-background',
    label: 'Office Background',
    prompt:
      'Replace with a modern office background with clean, professional workspace elements.',
  },
  {
    id: 'remove-only',
    label: 'Remove Only',
    prompt:
      'Remove the background completely, creating a transparent or clean white background.',
  },
];

export const faceSwapPrompts: Prompt[] = [
  {
    id: 'family-photo',
    label: 'Family Photo',
    prompt:
      'Seamlessly swap faces in a family photo while maintaining natural lighting and expressions.',
  },
  {
    id: 'group-friends',
    label: 'Group of Friends',
    prompt:
      'Swap faces among friends in a group photo with consistent skin tone and facial features.',
  },
  {
    id: 'professional-swap',
    label: 'Professional Photo',
    prompt:
      'Face swap in a professional setting while maintaining the formal atmosphere and quality.',
  },
  {
    id: 'fun-creative',
    label: 'Creative Fun',
    prompt:
      'Creative face swap for entertainment purposes with playful and fun results.',
  },
];

export const clothesPrompts: Prompt[] = [
  {
    id: 'business-attire',
    label: 'Business Attire',
    prompt:
      'Change to professional business attire including suit, dress shirt, and formal accessories.',
  },
  {
    id: 'casual-style',
    label: 'Casual Style',
    prompt:
      'Change to casual clothing like jeans, t-shirt, and comfortable everyday wear.',
  },
  {
    id: 'formal-evening',
    label: 'Formal Evening',
    prompt:
      'Change to elegant formal evening wear suitable for special occasions and events.',
  },
  {
    id: 'seasonal-outfit',
    label: 'Seasonal Outfit',
    prompt:
      'Change to season-appropriate clothing like winter coats, summer dresses, or spring jackets.',
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
  prompts: Prompt[];
  labelActionButton: string;
  executionFunction: string; // Reference to the server function name
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

// Get appropriate prompts for each Magic Hour tool
function getPromptsForTool(toolId: string): Prompt[] {
  switch (toolId) {
    case 'ai-image-generator':
      return createPrompts;
    case 'ai-gif-creator':
      return gifPrompts;
    case 'ai-headshot-generator':
      return headshotPrompts;
    case 'ai-meme-generator':
      return memePrompts;
    case 'image-background-remover':
      return backgroundPrompts;
    case 'face-swap-photo':
      return faceSwapPrompts;
    case 'ai-clothes-changer':
      return clothesPrompts;
    default:
      return createPrompts; // Default fallback
  }
}

// Tool action button labels mapping
const toolActionLabels: Record<string, string> = {
  'ai-image-generator': 'Generate Images',
  'ai-gif-creator': 'Create GIF',
  'ai-headshot-generator': 'Generate Headshot',
  'ai-meme-generator': 'Create Meme',
  'image-background-remover': 'Remove Background',
  'face-swap-photo': 'Swap Faces',
  'ai-clothes-changer': 'Change Clothes',
};

// Tool execution function mapping - Direct mapping to specific Magic Hour functions
const toolExecutionFunctions: Record<string, string> = {
  'ai-image-generator': 'generateAIImage',
  'ai-gif-creator': 'generateAIGif',
  'ai-headshot-generator': 'generateAIHeadshot',
  'ai-meme-generator': 'generateAIMeme',
  'image-background-remover': 'removeImageBackground',
  'face-swap-photo': 'swapFaces',
  'ai-clothes-changer': 'changeClothes',
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
    prompts: getPromptsForTool(id),
    labelActionButton: toolActionLabels[id] || 'Execute Tool',
    executionFunction: toolExecutionFunctions[id] || 'executeGenericTool',
  })
);

// Gemini AI Image Editor tool configuration
const geminiImageEditorTool: Tool = {
  id: 'gemini-ai-image-editor',
  name: 'AI Image Editor',
  description: 'Edit and transform images using AI',
  credits: 50,
  parameters: {
    referenceImage: {
      type: 'image_b64',
      required: true,
      label: 'Source Image',
      placeholder: 'Upload image to edit',
    },
    prompt: {
      type: 'string',
      required: true,
      label: 'Edit Instructions',
      placeholder: 'Describe how you want to edit or transform the image...',
    },
    temperature: {
      type: 'number',
      min: 0,
      max: 1,
      default: 0.7,
      label: 'Creativity Level',
      placeholder:
        'How creative should the AI be? (0 = precise, 1 = very creative)',
    },
  },
  thumbnail: 'https://getstyled.art/icons/logo_v2_96.webp',
  isNew: false,
  prompts: editPrompts,
  labelActionButton: 'Edit Image',
  executionFunction: 'executeGeminiImageEditor',
};

// Export all available tools
export const availableTools: Tool[] = [
  // Gemini AI Image Editor (using existing Gemini integration)
  geminiImageEditorTool,
  // All Magic Hour tools
  ...magicHourTools,
];
