import { GoogleGenAI, Type } from '@google/genai';
import { UserInput, CharacterProfile, StoryboardData, AspectRatio, Scene } from '../types';

// Simple round-robin to cycle through multiple API keys for better rate limiting.
let keyIndex = 0;
const getAiClient = (apiKeys: string[]): GoogleGenAI => {
  if (!apiKeys || apiKeys.length === 0) {
    throw new Error("API key is not configured.");
  }
  const key = apiKeys[keyIndex];
  keyIndex = (keyIndex + 1) % apiKeys.length;
  return new GoogleGenAI({ apiKey: key });
};

const safetyInstruction = `
    **CRITICAL SAFETY INSTRUCTION:**
    You must strictly adhere to all safety policies. Do not generate content that is sexually explicit, hateful, harassing, violent, or promotes self-harm. 
    All content, including character descriptions, actions, dialogue, and visual elements, must be appropriate for a general, family-friendly audience.
    If a user prompt can be interpreted in multiple ways, you must always choose the safest and most positive interpretation. Avoid any controversial or sensitive topics.
`;

/**
 * Splits a script into smaller chunks based on a target word count.
 * This is crucial for processing long scripts without losing context or consistency.
 */
function chunkScript(script: string, chunkSizeInWords: number): string[] {
    const words = script.split(/\s+/);
    const chunks: string[] = [];
    if (words.length === 0 || (words.length === 1 && words[0] === '')) {
        return [];
    }

    for (let i = 0; i < words.length; i += chunkSizeInWords) {
        const chunk = words.slice(i, i + chunkSizeInWords);
        chunks.push(chunk.join(' '));
    }
    
    return chunks;
}


/**
 * A helper function to call the Gemini API with a structured JSON response.
 */
const generateJson = async <T>(
    prompt: string, 
    responseSchema: object, 
    apiKeys: string[]
): Promise<T> => {
    let lastError: Error | null = null;
    const initialKeyIndex = keyIndex;

    for (let i = 0; i < apiKeys.length; i++) {
        const ai = getAiClient(apiKeys);
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction: safetyInstruction,
                    responseMimeType: 'application/json',
                    responseSchema,
                },
            });
            
            const jsonText = response.text.trim();
            return JSON.parse(jsonText) as T;
        } catch (error) {
            console.error(`API call failed with key index ${keyIndex - 1}:`, error);
            lastError = error instanceof Error ? error : new Error(String(error));
            if (keyIndex === initialKeyIndex) {
                 break;
            }
        }
    }
    
    console.error("All API keys failed for this request.", lastError);
    throw new Error("The AI service is currently unavailable or all keys have reached their quota. Please try again in a few moments.");
};


/**
 * A helper function to call the Gemini API for plain text response (like a script).
 */
const generateText = async (
    prompt: string, 
    apiKeys: string[]
): Promise<string> => {
    let lastError: Error | null = null;
    const initialKeyIndex = keyIndex;

    for (let i = 0; i < apiKeys.length; i++) {
        const ai = getAiClient(apiKeys);
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction: safetyInstruction,
                },
            });
            return response.text;
        } catch (error) {
            console.error(`API call failed with key index ${keyIndex - 1}:`, error);
            lastError = error instanceof Error ? error : new Error(String(error));
            if (keyIndex === initialKeyIndex) {
                 break;
            }
        }
    }
    
    console.error("All API keys failed for this request.", lastError);
    throw new Error("The AI service is currently unavailable or all keys have reached their quota. Please try again in a few moments.");
};


export const getStyleSuggestions = async (
  videoStyle: string,
  imageStyleOptions: string[],
  writingStyleOptions: string[],
  apiKeys: string[]
): Promise<{ imageStyle: string; writingStyle: string }> => {
  const prompt = `
    Given the video style "${videoStyle}", suggest the most appropriate image style and writing style from the provided lists.
    - The image style should visually complement the video style.
    - The writing style (tone) should match the overall mood of the video style.

    Available Image Styles: ${imageStyleOptions.join(', ')}
    Available Writing Styles: ${writingStyleOptions.join(', ')}

    Return ONLY a single, valid JSON object with your suggestions, using the exact string values from the lists provided.
    The JSON object must have two keys: "imageStyle" and "writingStyle".
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      imageStyle: { type: Type.STRING },
      writingStyle: { type: Type.STRING },
    },
    required: ['imageStyle', 'writingStyle'],
  };

  return generateJson<{ imageStyle: string; writingStyle: string }>(prompt, schema, apiKeys);
};

export const generateCharacterProfile = async (userInput: UserInput, apiKeys: string[]): Promise<CharacterProfile> => {
    const availableVoices = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'].join(', ');
    const prompt = `
        Create a character profile for a short video based on the following user input.
        The profile must include 2-3 main characters and one primary setting.
        For each character, provide a name and a detailed, visually-rich description focusing on specific, non-negotiable "visual anchors": facial features, hair style/color, signature wardrobe, and body type. This description is CRITICAL for generating consistent character images later. ALSO, assign a distinct voice for each character from the following available list: ${availableVoices}.
        Finally, assign a voice for the Narrator as well, which can be the same as a character's voice but it's better if it's unique.

        User Input:
        - Topic: ${userInput.topic}
        - Channel Type: ${userInput.channelType}
        - Video Style: ${userInput.videoStyle}
        - Language: ${userInput.language}

        Respond in ${userInput.language}.
        Return ONLY a single, valid JSON object matching the specified schema.
    `;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            characters: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "Character's name." },
                        description: { type: Type.STRING, description: "Detailed visual and personality description, including specific visual anchors." },
                        voice: { type: Type.STRING, description: `The assigned voice model for the character from the list: ${availableVoices}.` }
                    },
                    required: ["name", "description", "voice"]
                }
            },
            setting: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Name of the setting." },
                    description: { type: Type.STRING, description: "Detailed description of the setting." }
                },
                required: ["name", "description"]
            },
            narratorVoice: { type: Type.STRING, description: `The assigned voice model for the narrator from the list: ${availableVoices}.` }
        },
        required: ["characters", "setting", "narratorVoice"]
    };

    return generateJson<CharacterProfile>(prompt, schema, apiKeys);
};

export const generateMasterScript = async (userInput: UserInput, characterProfile: CharacterProfile, apiKeys: string[]): Promise<string> => {
    const wordsPerSecond = 1.625; // Based on 13 words per 8-second scene for accurate pacing.
    const targetWordCount = Math.round(userInput.durationInSeconds * wordsPerSecond);
    const varianceInSeconds = 60; // Increased variance for longer scripts, +/- 1 minute.
    const minWordCount = Math.max(30, Math.round((userInput.durationInSeconds - varianceInSeconds) * wordsPerSecond));
    const maxWordCount = Math.round((userInput.durationInSeconds + varianceInSeconds) * wordsPerSecond);

    const prompt = `
        You are an expert AI scriptwriter for YouTube videos. Your task is to write a complete, compelling script based on the user's request, following a professional, structured format.

        **Core Concept:**
        - Topic: ${userInput.topic}
        - Channel Type: ${userInput.channelType}
        - Style: ${userInput.videoStyle} video, with a ${userInput.writingStyle} tone.
        - Characters: ${JSON.stringify(characterProfile.characters.map(c => c.name))}
        - Setting: ${characterProfile.setting.name}
        - Language: ${userInput.language}
        
        **ABSOLUTELY CRITICAL DURATION REQUIREMENT:**
        The final script's total word count (including all narration and dialogue) MUST be written to match a video duration of **${userInput.durationInSeconds} seconds**.
        - TARGET WORD COUNT: **${targetWordCount} words**. (Based on a precise calculation of ${wordsPerSecond} words per second for ideal pacing).
        - ACCEPTABLE RANGE: Your final script must have a word count between **${minWordCount}** and **${maxWordCount}** words.
        - This is NOT a suggestion, but a hard constraint. You must carefully pace the story, narration, and dialogue to meet this length.
        - **FINAL CHECK:** Before you output the final script, you must perform an internal word count. If the script is outside the allowed range of ${minWordCount} to ${maxWordCount} words, you MUST rewrite it until it complies. Your primary goal is to meet this duration requirement. Failure to do so will result in an incorrect output.

        **CRITICAL SCRIPT STRUCTURE (LEARN FROM THIS EXAMPLE):**
        You must structure the script with clear sections like an engaging documentary or analysis video. Do NOT copy the content of the example, only learn its structure, pacing, and format. The final output must be a seamless script, not a list of sections.

        --- SCRIPT STRUCTURE EXAMPLE ---
        Video Title: [Generate an appropriate title based on the topic]

        Opening Hook (approx. 5-10% of total time):
        - Start with a dramatic, attention-grabbing statement or visual description.
        - Pose a question to the audience to create curiosity.
        - Briefly introduce the video's core mystery or topic.
        - Example: "[SCENE START] Slow-motion shot of a city being ravaged by a storm. NARRATOR: 'Year 2042... the world we knew was gone. But before the chaos... came the silence. How did it all begin?' [SCENE END]"

        Context/Background (approx. 15-20% of total time):
        - Set the stage. Provide historical context or background information necessary to understand the topic.
        - Introduce the key players, concepts, or the timeline of events.
        - Example: "[SCENE START] A timeline graphic appears, starting from 2031. NARRATOR: 'The second decade of the 21st century ended with promise. But the planet had other plans. The first signs appeared in 2031...' [SCENE END]"

        Main Analysis / Story Body (approx. 50-60% of total time):
        - This is the largest section. Dive deep into the main topic.
        - Present evidence, analyze events, tell the core story, and break it down into logical sub-points.
        - Example: "[SCENE START] Gameplay footage from the Discarded map. NARRATOR: 'In Alang, India, the coastline receded for miles, turning the world's largest ship-breaking yard into a rusted graveyard...' [SCENE END]"

        Impact / Consequences (Can be part of the main analysis):
        - Discuss the social, emotional, or practical consequences of the events in the story.
        - Example: "[SCENE START] Images of the No-Pat Specialists. NARRATOR: 'This led to the largest migration in human history. 1.2 billion people were displaced, giving rise to the Non-Patriated...' [SCENE END]"

        Conclusion & Teaser (approx. 5-10% of total time):
        - Summarize the key points or the journey of the video.
        - Provide a concluding thought that leaves an impact.
        - CRUCIAL: End with a hook or teaser for a potential "Part 2" or the next video to encourage viewer retention.
        - Example: "[SCENE START] A final, sweeping shot of the chaotic world. NARRATOR: 'Nature struck the first blow. But it was only the beginning... In the next video, we will explore the event that plunged humanity into darkness: The Blackout of 2040.' [SCENE END]"

        Call to Action (CTA):
        - End the script with a clear call to action for the audience.
        - Example: "NARRATOR: 'If you found this analysis insightful, be sure to like, subscribe, and share your thoughts in the comments below.'"
        --- END OF EXAMPLE ---

        **CRITICAL FINAL REQUIREMENT:**
        The script MUST conclude with a Call to Action (CTA) like the example shown above. The CTA is a non-negotiable part of the script and must be included, even while adhering to the word count. It is the absolute final part of the script.

        **SCRIPT FORMATTING:**
        - The script must follow a classic three-act structure, but integrated within the documentary format above.
        - Use standard script formatting.
        - Clearly label character names in ALL CAPS before their dialogue.
        - Use "(NARRATOR)" for narration/voiceover parts.
        - Describe actions and settings concisely within [SCENE START] and [SCENE END] tags.
        
        Now, write the entire script in **${userInput.language}** for the user's topic, adhering strictly to all structure, duration, and formatting rules. The final output should be a single, cohesive script.
    `;

    return generateText(prompt, apiKeys);
};


export const breakdownScriptIntoScenes = async (userInput: UserInput, characterProfile: CharacterProfile, masterScript: string, apiKeys: string[]): Promise<StoryboardData> => {
    // Step 1: Define "The Director's Bible" - the single source of truth for consistency.
    const directorsBible = `
        **THE DIRECTOR'S BIBLE (NON-NEGOTIABLE RULES):**
        This is the source of truth for the entire project. Adhere to it strictly in every single scene you generate.

        1.  **Core Concept:**
            - Style: ${userInput.videoStyle} video, ${userInput.imageStyle} visuals, ${userInput.writingStyle} tone.
            - Language: ${userInput.language}
            - Aspect Ratio: ${userInput.aspectRatio}

        2.  **Locked Character & Setting Profiles (Source of Visual Truth):**
            - Profile: ${JSON.stringify(characterProfile)}
            - **CRITICAL CONSISTENCY RULE:** For the 'master_description' field, find the character speaking or acting in the scene and insert their FULL, UNCHANGED description from this Profile. If no specific character is active (e.g., narrator-only scene), use the Setting's description.

        3.  **Locked Voices (Source of Audio Truth):**
            - **CRITICAL VOICE CONSISTENCY:** For the 'voice_model' field, you MUST find the character speaking ('dialogue_character') and use the exact voice model name assigned to them in the Character Profile above. If the speaker is "Narrator", use the assigned 'narratorVoice'.

        4.  **Core Cinematic & Style Rules:**
            - **ABSOLUTELY CRITICAL STYLE RULE:** The 'style_notes' field is the most important instruction for visual generation. It MUST be a detailed string that explicitly defines the visual characteristics of both the video and image style. This exact string will be used to generate the visuals, so it must be comprehensive and accurate. Example: "Video Style: Cinematic, Image Style: Cinematic - characterized by high-contrast lighting, deep shadows, smooth camera movements, and a shallow depth of field." This note must be applied UNIFORMLY to EVERY scene without fail.
            - **PROFESSIONAL CINEMATOGRAPHY:** For the 'camera_shot' field, suggest a professional camera shot that would best capture the moment (e.g., "Close-up on the character's reaction", "Wide establishing shot of the city", "Dynamic tracking shot following the action", "Point of View (POV) shot").
            - **CRITICAL AUDIO RULE:** For the 'audio_description', write a brief, narrative description of the scene's soundscape based on the script's context. Example: 'A gentle wind rustles through dry autumn leaves, creating a soft, whispering soundscape.'
            - **CRITICAL DIALOGUE LENGTH RULE:** A single scene's 'dialogue_line' MUST NOT exceed 13 words. If a line of dialogue or narration from the Master Script is longer than 13 words, you MUST split it into multiple consecutive scenes. Each of these new scenes will contain a segment of the original line (max 13 words).

        5.  **CRITICAL CINEMATIC RULE FOR LONG DIALOGUE:**
            - When a line of dialogue or narration from the Master Script is longer than 13 words and you must split it into multiple consecutive scenes, you **MUST NOT** repeat the 'scene_description' and 'camera_shot' identically.
            - Instead, treat this as a mini-sequence and apply cinematic techniques to make it dynamic:
                - **Vary Camera Shots:** Start with a medium shot, then cut to a close-up on the next line to emphasize emotion.
                - **Use Reaction Shots:** If another character is present, cut to their reaction.
                - **Use Cutaways:** If the dialogue describes an object or place, show a shot of that object/place.
                - **Introduce Subtle Actions:** Have the character perform a small action (e.g., sip coffee, look away) and describe it in the 'scene_description'.
            - **The goal is for each consecutive scene to offer a slightly different visual perspective, even as the same character continues speaking.**

        **--- END OF DIRECTOR'S BIBLE ---**
    `;

    // Schemas for API calls, derived from the original storyboardSchema
     const scenePromptSchema = {
        type: Type.OBJECT,
        properties: {
            scene_context: {
                type: Type.OBJECT,
                properties: {
                    scene_number: { type: Type.INTEGER, description: "Placeholder sequence number." },
                    total_scenes: { type: Type.INTEGER, description: "Placeholder total number of scenes." }
                },
                required: ["scene_number", "total_scenes"]
            },
            character_name: { type: Type.STRING, description: "Name of the main character in this scene, or the setting name if no character is present." },
            master_description: { type: Type.STRING, description: "The full, original, unchanged description of the character (or setting) from the profile. This is the source of truth for visual consistency." },
            scene_description: { type: Type.STRING, description: "A visual description of the character's specific actions, expressions, and the setting in this scene, translated from the master script." },
            dialogue_line: { type: Type.STRING, description: "The character's or narrator's line of dialogue, copied exactly from the master script. Can be empty." },
            dialogue_character: { type: Type.STRING, description: "The name of the character speaking or 'Narrator'. Copied exactly from the master script. Can be empty." },
            voice_model: { type: Type.STRING, description: "The specific pre-defined voice model name for the speaking character or narrator (e.g., 'Zephyr', 'Puck')." },
            camera_shot: { type: Type.STRING, description: "A professional suggestion for the camera shot (e.g., 'Close-up', 'Wide shot')." },
            audio_description: { type: Type.STRING, description: "A narrative description of the scene's soundscape." },
            style_notes: { type: Type.STRING, description: "CRITICAL: A detailed string defining the visual style of the video and image." }
        },
        required: ["scene_context", "character_name", "master_description", "scene_description", "audio_description", "style_notes", "camera_shot", "voice_model"]
     };

    const scenesSchema = {
        type: Type.OBJECT,
        properties: {
            scenes: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        scene_number: { type: Type.INTEGER },
                        act: { type: Type.INTEGER },
                        scene_prompt_json: scenePromptSchema
                    },
                    required: ["scene_number", "act", "scene_prompt_json"]
                }
            }
        },
        required: ["scenes"]
    };

    const promotionalContentSchema = {
        type: Type.OBJECT,
        properties: {
            thumbnail_prompt: { type: Type.STRING },
            youtube: {
                type: Type.OBJECT,
                properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, hashtags: { type: Type.STRING } },
                required: ["title", "description", "hashtags"]
            },
            facebook: {
                type: Type.OBJECT,
                properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, hashtags: { type: Type.STRING } },
                required: ["title", "description", "hashtags"]
            },
            tiktok: {
                type: Type.OBJECT,
                properties: { caption: { type: Type.STRING }, hashtags: { type: Type.STRING } },
                required: ["caption", "hashtags"]
            }
        },
        required: ["thumbnail_prompt", "youtube", "facebook", "tiktok"]
    };

    // Step 2: Split the script into manageable chunks to ensure consistency
    const SCRIPT_CHUNK_SIZE_IN_WORDS = 350;
    const scriptChunks = chunkScript(masterScript, SCRIPT_CHUNK_SIZE_IN_WORDS);
    
    // Step 3: Process each chunk to get scenes concurrently
    const scenePromises = scriptChunks.map(chunk => {
        const prompt = `
            ${directorsBible}

            **Your Task:**
            Your task is to act as an AI Video Director. Read the provided SCRIPT CHUNK below and break it down into a series of detailed scenes.
            You MUST follow all rules in The Director's Bible.
            The script provided is only a small part of a larger story. Only process the chunk provided.

            **SCRIPT CHUNK:**
            ---
            ${chunk}
            ---

            **Instructions:**
            1.  Break down the SCRIPT CHUNK into scenes, preserving the narrative flow.
            2.  Translate every key action, line of dialogue, and piece of narration into its own distinct scene.
            3.  Return ONLY a single, valid JSON object that strictly follows the provided schema, containing an array of the scenes you generated for this chunk. Ensure all text is in ${userInput.language}.
        `;
        type SceneResponse = { scenes: Scene[] };
        return generateJson<SceneResponse>(prompt, scenesSchema, apiKeys);
    });

    // Step 4: Generate promotional content in parallel using the full script
    const promoPrompt = `
        ${directorsBible}

        **Your Task:**
        You are an AI Marketing Specialist. Read the ENTIRE Master Script below and generate compelling promotional content for it.

        **Master Script (Full Context):**
        ---
        ${masterScript}
        ---

        **Instructions:**
        Generate promotional materials in ${userInput.language} based on the overall story.
        Return ONLY a single, valid JSON object that strictly follows the provided schema for promotional content.
    `;
    
    type PromoResponse = { promotional_content: StoryboardData['promotional_content'] };
    const promoPromise = generateJson<PromoResponse>(promoPrompt, {
        type: Type.OBJECT,
        properties: { promotional_content: promotionalContentSchema },
        required: ["promotional_content"]
    }, apiKeys);

    // Step 5: Await all promises and combine the results
    const [chunkedSceneResults, promoResponse] = await Promise.all([
        Promise.all(scenePromises),
        promoPromise
    ]);

    const allScenes = chunkedSceneResults.flatMap(result => result.scenes || []);

    return {
        scenes: allScenes,
        promotional_content: promoResponse.promotional_content,
        master_script: masterScript
    };
};


export const generateImage = async (prompt: string, aspectRatio: AspectRatio, apiKeys: string[]): Promise<string> => {
    let lastError: Error | null = null;
    const initialKeyIndex = keyIndex;
    
    for (let i = 0; i < apiKeys.length; i++) {
        const ai = getAiClient(apiKeys);
        try {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: aspectRatio,
                },
            });

            if (!response.generatedImages || response.generatedImages.length === 0) {
                throw new Error("No image was generated by the API.");
            }

            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return base64ImageBytes;
        } catch (error) {
            console.error(`Image generation failed with key index ${keyIndex - 1}:`, error);
            lastError = error instanceof Error ? error : new Error(String(error));
            if (keyIndex === initialKeyIndex) {
                 break;
            }
        }
    }
    
    console.error("All API keys failed for image generation.", lastError);
    throw new Error("The image generation service is currently unavailable or all keys have reached their quota.");
};