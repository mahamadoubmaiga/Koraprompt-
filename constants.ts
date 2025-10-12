
import { Generator, Template } from './types';

export const GENERATORS: Generator[] = [
    { id: 'veo', name: 'Veo', type: 'video' },
    { id: 'runway', name: 'Runway', type: 'video' },
    { id: 'pika', name: 'Pika', type: 'video' },
    { id: 'sora', name: 'Sora', type: 'video' },
    { id: 'midjourney', name: 'MidJourney', type: 'image' },
    { id: 'stable-diffusion', name: 'Stable Diffusion', type: 'image' },
    { id: 'dalle', name: 'DALL·E 3', type: 'image' },
    { id: 'ideogram', name: 'Ideogram', type: 'image' },
];

export const VIDEO_CATEGORIES = ['cinematic', 'tiktok', 'surreal', 'action', 'storytelling', 'music_video'];
export const IMAGE_CATEGORIES = ['portrait', 'landscape', 'logo', 'surreal', 'realistic', 'fashion'];

export const TEMPLATES: Template[] = [
    { id: 'v1', name: 'Cinematic Drone Shot', prompt: 'Epic 4K cinematic drone footage of a lone hiker on a snowy mountain peak at sunrise, dramatic lighting, lens flare, sweeping orchestral score, ultra-realistic.', type: 'video', category: 'cinematic', generator: 'veo' },
    { id: 'v2', name: 'Viral TikTok Dance', prompt: 'High-energy, fast-paced dance video, vibrant neon background, catchy pop song, quick cuts, energetic transitions, trending on TikTok.', type: 'video', category: 'tiktok', generator: 'pika' },
    { id: 'i1', name: 'Photorealistic Portrait', prompt: 'Ultra-realistic portrait of an elderly woman with deep wrinkles, soft natural light, shallow depth of field, 85mm lens, detailed skin texture, award-winning photography. --ar 4:3', type: 'image', category: 'portrait', generator: 'midjourney' },
    { id: 'i2', name: 'Surreal Landscape', prompt: 'A breathtaking surreal landscape with floating islands, giant glowing mushrooms, and a river of stars, fantasy art style, vibrant colors, highly detailed, by Studio Ghibli.', type: 'image', category: 'surreal', generator: 'dalle' },
    { id: 'v3', name: 'Explosive Action Scene', prompt: 'A chaotic car chase scene in a cyberpunk city at night, rain-slicked streets, neon reflections, explosions, intense motion blur, high-octane action, sound of screeching tires and heavy synthwave music.', type: 'video', category: 'action', generator: 'runway' },
    { id: 'i3', name: 'Minimalist Logo Design', prompt: 'Clean, minimalist logo design for a coffee shop named "Aura", a simple line art of a coffee cup with a subtle halo effect, on a white background, vector graphic.', type: 'image', category: 'logo', generator: 'ideogram' },
];
