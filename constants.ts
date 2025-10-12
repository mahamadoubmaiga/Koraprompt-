import { Generator, Template } from './types';

export const GENERATORS: Generator[] = [
    { id: 'veo', name: 'Veo', type: 'video' },
    { id: 'runway', name: 'Runway', type: 'video' },
    { id: 'pika', name: 'Pika', type: 'video' },
    { id: 'sora', name: 'Sora', type: 'video' },
    { id: 'kling', name: 'Kling', type: 'video' },
    { id: 'luma', name: 'Luma Dream Machine', type: 'video' },
    { id: 'midjourney', name: 'MidJourney', type: 'image' },
    { id: 'stable-diffusion', name: 'Stable Diffusion', type: 'image' },
    { id: 'dalle', name: 'DALL·E 3', type: 'image' },
    { id: 'ideogram', name: 'Ideogram', type: 'image' },
    { id: 'firefly', name: 'Adobe Firefly', type: 'image' },
    { id: 'leonardo', name: 'Leonardo.Ai', type: 'image' },
];

export const VIDEO_CATEGORIES = ['cinematic', 'tiktok', 'surreal', 'action', 'storytelling', 'music_video'];
export const IMAGE_CATEGORIES = ['portrait', 'landscape', 'logo', 'surreal', 'realistic', 'fashion'];

export const TEMPLATES: Template[] = [
    { id: 'v1', name: 'Cinematic Drone Shot', prompt: 'Epic 4K cinematic drone footage of a lone hiker on a snowy mountain peak at sunrise, dramatic lighting, lens flare, sweeping orchestral score, ultra-realistic.', type: 'video', category: 'cinematic', generator: 'veo', imageUrl: 'https://images.pexels.com/photos/1525041/pexels-photo-1525041.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 'v2', name: 'Viral TikTok Dance', prompt: 'High-energy, fast-paced dance video, vibrant neon background, catchy pop song, quick cuts, energetic transitions, trending on TikTok.', type: 'video', category: 'tiktok', generator: 'pika', imageUrl: 'https://images.pexels.com/photos/7187375/pexels-photo-7187375.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 'i1', name: 'Photorealistic Portrait', prompt: 'Ultra-realistic portrait of an elderly woman with deep wrinkles, soft natural light, shallow depth of field, 85mm lens, detailed skin texture, award-winning photography. --ar 4:3', type: 'image', category: 'portrait', generator: 'midjourney', imageUrl: 'https://images.pexels.com/photos/943084/pexels-photo-943084.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 'i2', name: 'Surreal Landscape', prompt: 'A breathtaking surreal landscape with floating islands, giant glowing mushrooms, and a river of stars, fantasy art style, vibrant colors, highly detailed, by Studio Ghibli.', type: 'image', category: 'surreal', generator: 'dalle', imageUrl: 'https://images.pexels.com/photos/2832034/pexels-photo-2832034.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 'v3', name: 'Explosive Action Scene', prompt: 'A chaotic car chase scene in a cyberpunk city at night, rain-slicked streets, neon reflections, explosions, intense motion blur, high-octane action, sound of screeching tires and heavy synthwave music.', type: 'video', category: 'action', generator: 'runway', imageUrl: 'https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 'i3', name: 'Minimalist Logo Design', prompt: 'Clean, minimalist logo design for a coffee shop named "Aura", a simple line art of a coffee cup with a subtle halo effect, on a white background, vector graphic.', type: 'image', category: 'logo', generator: 'ideogram', imageUrl: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=600' },
];

export const SURPRISE_ME_IDEAS: string[] = [
    'A library where the books fly like birds.',
    'A city built inside a giant, ancient tree.',
    'An astronaut discovering a garden on the moon.',
    'A steampunk detective solving a case in Victorian London.',
    'A friendly robot serving ice cream to children in a park.',
    'A fantasy warrior riding a giant wolf into battle.',
    'A quiet, rainy day in a cozy Tokyo coffee shop.',
    'A futuristic car race through a neon-lit city.',
    'A magical forest where plants glow in the dark.',
    'Two cats having a sophisticated conversation over tea.',
];