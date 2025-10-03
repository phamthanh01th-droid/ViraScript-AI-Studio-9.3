
export enum AppStage {
  INPUT,
  CHARACTER_REVIEW,
  STORYBOARD,
  ERROR,
}

export type ScriptSource = 'generate' | 'provide';

export type AspectRatio = '16:9' | '9:16';

export interface UserInput {
  scriptSource: ScriptSource;
  scriptContent: string;
  channelType: string;
  videoStyle: string;
  imageStyle: string;
  writingStyle: string;
  durationInSeconds: number;
  language: string;
  aspectRatio: AspectRatio;
}

export interface Character {
  name: string;
  description: string;
  voice: string;
}

export interface Setting {
  name: string;
  description: string;
}

export interface CharacterProfile {
  characters: Character[];
  setting: Setting;
  narratorVoice: string;
}

export interface StoryOutline {
  act1_summary: string;
  act2_summary:string;
  act3_summary: string;
}

export interface Scene {
  scene_number: number;
  act: number; // To which act (1, 2, or 3) this scene belongs
  scene_prompt_json: object; // This will hold the entire structured JSON prompt
}

export interface YoutubeFacebookContent {
    title: string;
    description: string;
    hashtags: string;
}

export interface TikTokContent {
    caption: string;
    hashtags: string;
}

export interface PromotionalContent {
    thumbnail_prompt: string;
    youtube: YoutubeFacebookContent;
    facebook: YoutubeFacebookContent;
    tiktok: TikTokContent;
}


export interface StoryboardData {
    scenes: Scene[];
    promotional_content: PromotionalContent;
    master_script: string;
}