import { GoogleGenAI, Type } from '@google/genai';
import { UserInput, CharacterProfile, StoryboardData, AspectRatio, Scene } from '../types';

// Simple round-robin to cycle through multiple API keys for better rate limiting.
export let keyIndex = 0;
export const apiKeyStatuses = new Map<string, 'active' | 'failed'>();

export const initializeKeys = (keys: string[]) => {
  keyIndex = 0;
  apiKeyStatuses.clear();
  keys.forEach(key => apiKeyStatuses.set(key, 'active'));
};


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

// --- START: Voice & Localization Engine ---

const voiceModelMap: Record<string, Record<string, string>> = {
  English: {
    'Zephyr (Female US)': 'en-US-Wavenet-F',
    'Kore (Female US)': 'en-US-Wavenet-E',
    'Puck (Male US)': 'en-US-Wavenet-B',
    'Charon (Male US)': 'en-US-Wavenet-D',
    'Fenrir (Male US)': 'en-US-Wavenet-A',
  },
  Vietnamese: {
    'Linh (Nữ Miền Bắc)': 'vi-VN-Wavenet-A',
    'Mai (Nữ Miền Nam)': 'vi-VN-Wavenet-C',
    'Quang (Nam Miền Bắc)': 'vi-VN-Wavenet-B',
    'Bảo (Nam Miền Nam)': 'vi-VN-Wavenet-D',
    'Giọng Chuẩn Nam': 'vi-VN-Standard-D',
  }
};

export const getAvailableVoices = (language: string): string[] => {
  return Object.keys(voiceModelMap[language] || voiceModelMap['English']);
};


const promptLocalizations = {
    English: {
        generateCharacterProfile: (userInput: UserInput, availableVoices: string) => `
            Create a character profile for a short video based on the following user input.
            The profile must include 2-3 main characters and one primary setting.
            For each character, provide a name and a detailed description that implies their gender (male or female). Also provide a visually-rich description focusing on specific, non-negotiable "visual anchors": facial features, hair style/color, signature wardrobe, and body type. This description is CRITICAL for generating consistent character images later.
            CRITICAL VOICE CASTING RULE: You MUST assign a distinct voice for each character from the following available list. The voice MUST match the character's implied gender. For example, a male character must be assigned a voice with "(Male)" in its name. Available Voices: ${availableVoices}.
            Finally, you MUST assign a MALE voice for the Narrator. The narrator's voice should be chosen from one of the "(Male)" options in the list.

            User Input:
            - Topic: ${userInput.topic}
            - Channel Type: ${userInput.channelType}
            - Video Style: ${userInput.videoStyle}
            - Language: ${userInput.language}

            Respond in ${userInput.language}.
            Return ONLY a single, valid JSON object matching the specified schema.
        `,
        generateMasterScript: (userInput: UserInput, characterProfile: CharacterProfile, targetWordCount: number, minWordCount: number, maxWordCount: number, wordsPerSecond: number) => `
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

            Context/Background (approx. 15-20% of total time):
            - Set the stage. Provide historical context or background information necessary to understand the topic.
            - Introduce the key players, concepts, or the timeline of events.

            Main Analysis / Story Body (approx. 50-60% of total time):
            - This is the largest section. Dive deep into the main topic.
            - Present evidence, analyze events, tell the core story, and break it down into logical sub-points.

            Conclusion & Teaser (approx. 5-10% of total time):
            - Summarize the key points or the journey of the video.
            - Provide a concluding thought that leaves an impact.
            - CRUCIAL: End with a hook or teaser for a potential "Part 2" or the next video to encourage viewer retention.
            
            Call to Action (CTA):
            - End the script with a clear call to action for the audience.
            --- END OF EXAMPLE ---

            **CRITICAL FINAL REQUIREMENT:**
            The script MUST conclude with a Call to Action (CTA) like the example shown above. The CTA is a non-negotiable part of the script and must be included, even while adhering to the word count. It is the absolute final part of the script.

            **SCRIPT FORMATTING:**
            - Use standard script formatting.
            - Clearly label character names in ALL CAPS before their dialogue.
            - Use "(NARRATOR)" for narration/voiceover parts.
            - Describe actions and settings concisely within [SCENE START] and [SCENE END] tags.
            
            Now, write the entire script in **${userInput.language}** for the user's topic, adhering strictly to all structure, duration, and formatting rules. The final output should be a single, cohesive script.
        `,
        directorsBible: (userInput: UserInput, characterProfile: CharacterProfile) => `
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
        `,
        breakdownTask: (chunk: string, language: string) => `
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
            3.  Return ONLY a single, valid JSON object that strictly follows the provided schema, containing an array of the scenes you generated for this chunk. Ensure all text is in ${language}.
        `,
        promoTask: (masterScript: string, language: string) => `
            **Your Task:**
            You are an AI Marketing Specialist. Read the ENTIRE Master Script below and generate compelling promotional content for it.

            **Master Script (Full Context):**
            ---
            ${masterScript}
            ---

            **Instructions:**
            Generate promotional materials in ${language} based on the overall story.
            Return ONLY a single, valid JSON object that strictly follows the provided schema for promotional content.
        `
    },
    'Vietnamese': {
        generateCharacterProfile: (userInput: UserInput, availableVoices: string) => `
            Tạo hồ sơ nhân vật cho một video ngắn dựa trên thông tin người dùng sau đây.
            Hồ sơ phải bao gồm 2-3 nhân vật chính và một bối cảnh chính.
            Đối với mỗi nhân vật, hãy cung cấp tên và một mô tả chi tiết ngụ ý giới tính của họ (nam hoặc nữ). Đồng thời cung cấp mô tả giàu hình ảnh, tập trung vào các "đặc điểm nhận dạng" cụ thể, không thể thay đổi: nét mặt, kiểu/màu tóc, trang phục đặc trưng và dáng người. Mô tả này CỰC KỲ QUAN TRỌNG để tạo ra hình ảnh nhân vật nhất quán sau này.
            QUY TẮC CHỌN GIỌNG NÓI TỐI QUAN TRỌNG: Bạn PHẢI gán một giọng nói riêng biệt cho mỗi nhân vật từ danh sách có sẵn sau. Giọng nói PHẢI khớp với giới tính ngụ ý của nhân vật. Ví dụ, một nhân vật nam phải được gán một giọng nói có chữ "(Nam)" trong tên. Danh sách giọng nói có sẵn: ${availableVoices}.
            Cuối cùng, bạn PHẢI gán một giọng NAM cho Người Dẫn Chuyện. Giọng của người dẫn chuyện nên được chọn từ một trong các tùy chọn có "(Nam)" trong danh sách.

            Thông tin người dùng:
            - Chủ đề: ${userInput.topic}
            - Thể loại kênh: ${userInput.channelType}
            - Phong cách video: ${userInput.videoStyle}
            - Ngôn ngữ: ${userInput.language}

            Phản hồi bằng ngôn ngữ ${userInput.language}.
            Chỉ trả về MỘT đối tượng JSON hợp lệ duy nhất khớp với schema đã chỉ định.
        `,
        generateMasterScript: (userInput: UserInput, characterProfile: CharacterProfile, targetWordCount: number, minWordCount: number, maxWordCount: number, wordsPerSecond: number) => `
            Bạn là một chuyên gia viết kịch bản AI cho video YouTube. Nhiệm vụ của bạn là viết một kịch bản hoàn chỉnh, hấp dẫn dựa trên yêu cầu của người dùng, theo một định dạng chuyên nghiệp và có cấu trúc.

            **Ý Tưởng Cốt Lõi:**
            - Chủ đề: ${userInput.topic}
            - Thể loại kênh: ${userInput.channelType}
            - Phong cách: Video ${userInput.videoStyle}, với giọng văn ${userInput.writingStyle}.
            - Nhân vật: ${JSON.stringify(characterProfile.characters.map(c => c.name))}
            - Bối cảnh: ${characterProfile.setting.name}
            - Ngôn ngữ: ${userInput.language}
            
            **YÊU CẦU THỜI LƯỢNG TUYỆT ĐỐI QUAN TRỌNG:**
            Tổng số từ của kịch bản cuối cùng (bao gồm tất cả lời dẫn và hội thoại) PHẢI được viết để khớp với thời lượng video là **${userInput.durationInSeconds} giây**.
            - SỐ TỪ MỤC TIÊU: **${targetWordCount} từ**. (Dựa trên tính toán chính xác ${wordsPerSecond} từ mỗi giây để có nhịp độ lý tưởng).
            - PHẠM VI CHẤP NHẬN ĐƯỢỢC: Kịch bản cuối cùng của bạn phải có số từ trong khoảng từ **${minWordCount}** đến **${maxWordCount}** từ.
            - Đây KHÔNG phải là một gợi ý, mà là một ràng buộc cứng. Bạn phải cẩn thận điều chỉnh nhịp độ câu chuyện, lời dẫn và hội thoại để đạt được độ dài này.
            - **KIỂM TRA CUỐI CÙNG:** Trước khi xuất ra kịch bản cuối cùng, bạn phải thực hiện đếm từ nội bộ. Nếu kịch bản nằm ngoài phạm vi cho phép từ ${minWordCount} đến ${maxWordCount} từ, bạn PHẢI viết lại cho đến khi tuân thủ. Mục tiêu chính của bạn là đáp ứng yêu cầu về thời lượng này.

            **CẤU TRÚC KỊCH BẢN TỐI QUAN TRỌNG (HỌC TỪ VÍ DỤ NÀY):**
            Bạn phải cấu trúc kịch bản với các phần rõ ràng như một video tài liệu hoặc phân tích chuyên nghiệp. KHÔNG sao chép nội dung của ví dụ, chỉ học cấu trúc, nhịp độ và định dạng của nó.

            --- VÍ DỤ CẤU TRÚC KỊCH BẢN ---
            Tiêu đề Video: [Tạo một tiêu đề phù hợp dựa trên chủ đề]

            Mở đầu Thu hút (khoảng 5-10% tổng thời gian):
            - Bắt đầu bằng một câu nói hoặc mô tả hình ảnh đầy kịch tính, thu hút sự chú ý.
            - Đặt một câu hỏi cho khán giả để tạo sự tò mò.
            - Giới thiệu ngắn gọn bí ẩn hoặc chủ đề cốt lõi của video.

            Bối cảnh/Nền tảng (khoảng 15-20% tổng thời gian):
            - Dựng lên sân khấu. Cung cấp bối cảnh lịch sử hoặc thông tin nền cần thiết để hiểu chủ đề.
            - Giới thiệu các nhân vật, khái niệm chính hoặc dòng thời gian của các sự kiện.

            Phân tích Chính / Thân bài (khoảng 50-60% tổng thời gian):
            - Đây là phần lớn nhất. Đi sâu vào chủ đề chính.
            - Trình bày bằng chứng, phân tích sự kiện, kể câu chuyện cốt lõi và chia nhỏ thành các điểm phụ logic.

            Kết luận & Gợi mở (khoảng 5-10% tổng thời gian):
            - Tóm tắt các điểm chính hoặc hành trình của video.
            - Đưa ra một suy nghĩ kết luận để lại tác động.
            - QUAN TRỌNG: Kết thúc bằng một gợi ý hoặc teaser cho một "Phần 2" tiềm năng hoặc video tiếp theo để khuyến khích người xem quay lại.
            
            Kêu gọi Hành động (CTA):
            - Kết thúc kịch bản bằng một lời kêu gọi hành động rõ ràng cho khán giả.
            --- KẾT THÚC VÍ DỤ ---

            **YÊU CẦU CUỐI CÙNG:**
            Kịch bản PHẢI kết thúc bằng một Lời Kêu gọi Hành động (CTA). Đây là phần bắt buộc và phải được bao gồm.

            **ĐỊNH DẠNG KỊCH BẢN:**
            - Sử dụng định dạng kịch bản tiêu chuẩn.
            - Ghi rõ tên nhân vật bằng CHỮ IN HOA trước lời thoại của họ.
            - Sử dụng "(NARRATOR)" hoặc "(NGƯỜI DẪN CHUYỆN)" cho các phần tường thuật.
            - Mô tả hành động và bối cảnh ngắn gọn trong thẻ [SCENE START] và [SCENE END].
            
            Bây giờ, hãy viết toàn bộ kịch bản bằng **${userInput.language}** cho chủ đề của người dùng, tuân thủ nghiêm ngặt tất cả các quy tắc về cấu trúc, thời lượng và định dạng.
        `,
        directorsBible: (userInput: UserInput, characterProfile: CharacterProfile) => `
            **KINH THÁNH CỦA ĐẠO DIỄN (QUY TẮC BẤT BIẾN):**
            Đây là nguồn chân lý cho toàn bộ dự án. Tuân thủ nghiêm ngặt trong mọi cảnh bạn tạo ra.

            1.  **Ý Tưởng Cốt Lõi:**
                - Phong cách: Video ${userInput.videoStyle}, hình ảnh ${userInput.imageStyle}, giọng văn ${userInput.writingStyle}.
                - Ngôn ngữ: ${userInput.language}
                - Tỷ lệ khung hình: ${userInput.aspectRatio}

            2.  **Hồ sơ Nhân vật & Bối cảnh Đã khóa (Nguồn Chân lý Hình ảnh):**
                - Hồ sơ: ${JSON.stringify(characterProfile)}
                - **QUY TẮC NHẤT QUÁN TỐI QUAN TRỌNG:** Đối với trường 'master_description', hãy tìm nhân vật đang nói hoặc hành động trong cảnh và chèn mô tả ĐẦY ĐỦ, KHÔNG THAY ĐỔI của họ từ Hồ sơ này. Nếu không có nhân vật cụ thể nào hoạt động, hãy sử dụng mô tả của Bối cảnh.

            3.  **Giọng nói Đã khóa (Nguồn Chân lý Âm thanh):**
                - **NHẤT QUÁN GIỌNG NÓI TỐI QUAN TRỌNG:** Đối với trường 'voice_model', bạn PHẢI tìm nhân vật đang nói ('dialogue_character') và sử dụng đúng tên mô hình giọng nói đã được gán cho họ trong Hồ sơ Nhân vật ở trên. Nếu người nói là "Narrator" (Người dẫn chuyện), hãy sử dụng 'narratorVoice' đã được gán.

            4.  **Quy tắc Điện ảnh & Phong cách Cốt lõi:**
                - **QUY TẮC PHONG CÁCH TUYỆT ĐỐI QUAN TRỌNG:** Trường 'style_notes' là hướng dẫn quan trọng nhất để tạo hình ảnh. Nó PHẢI là một chuỗi chi tiết xác định rõ ràng các đặc điểm hình ảnh của cả phong cách video và hình ảnh. Chuỗi này sẽ được sử dụng để tạo ra hình ảnh, vì vậy nó phải toàn diện và chính xác. Ví dụ: "Phong cách Video: Điện ảnh, Phong cách Hình ảnh: Điện ảnh - đặc trưng bởi ánh sáng tương phản cao, bóng sâu, chuyển động máy quay mượt mà và độ sâu trường ảnh nông." Ghi chú này phải được áp dụng ĐỒNG NHẤT cho MỌI cảnh.
                - **QUAY PHIM CHUYÊN NGHIỆP:** Đối với trường 'camera_shot', hãy đề xuất một góc máy chuyên nghiệp để ghi lại khoảnh khắc tốt nhất (ví dụ: "Cận cảnh phản ứng của nhân vật", "Toàn cảnh thiết lập thành phố").
                - **QUY TẮC ÂM THANH:** Đối với 'audio_description', hãy viết một mô tả ngắn gọn về âm thanh của cảnh dựa trên bối cảnh kịch bản. Ví dụ: 'Một cơn gió nhẹ xào xạc qua những chiếc lá khô mùa thu, tạo ra một không gian âm thanh thì thầm, nhẹ nhàng.'
                - **QUY TẮC ĐỘ DÀI LỜI THOẠI:** 'dialogue_line' của một cảnh KHÔNG ĐƯỢC vượt quá 13 từ. Nếu một dòng thoại hoặc lời dẫn từ Kịch bản Gốc dài hơn 13 từ, bạn PHẢI chia nó thành nhiều cảnh liên tiếp.

            5.  **QUY TẮC ĐIỆN ẢNH CHO LỜI THOẠI DÀI:**
                - Khi một dòng thoại dài hơn 13 từ và bạn phải chia nó thành nhiều cảnh, bạn **KHÔNG ĐƯỢC** lặp lại 'scene_description' và 'camera_shot' một cách y hệt.
                - Thay vào đó, hãy coi đây là một chuỗi cảnh quay và áp dụng các kỹ thuật điện ảnh:
                    - **Thay đổi góc máy:** Bắt đầu bằng cảnh trung, sau đó chuyển sang cận cảnh ở dòng tiếp theo để nhấn mạnh cảm xúc.
                    - **Sử dụng cảnh quay phản ứng:** Cắt cảnh sang phản ứng của một nhân vật khác.
                    - **Sử dụng cảnh quay xen kẽ:** Nếu lời thoại mô tả một đối tượng, hãy hiển thị cảnh quay của đối tượng đó.
                    - **Thêm hành động nhỏ:** Cho nhân vật thực hiện một hành động nhỏ (ví dụ: nhấp một ngụm cà phê) và mô tả nó trong 'scene_description'.
                - **Mục tiêu là mỗi cảnh liên tiếp cung cấp một góc nhìn hình ảnh hơi khác một chút.**

            **--- KẾT THÚC KINH THÁNH CỦA ĐẠO DIỄN ---**
        `,
        breakdownTask: (chunk: string, language: string) => `
            **Nhiệm vụ của bạn:**
            Bạn sẽ đóng vai một Đạo diễn Video AI. Đọc ĐOẠN KỊCH BẢN được cung cấp dưới đây và chia nó thành một loạt các cảnh chi tiết.
            Bạn PHẢI tuân theo tất cả các quy tắc trong Kinh Thánh Của Đạo Diễn.
            Kịch bản được cung cấp chỉ là một phần nhỏ của một câu chuyện lớn hơn. Chỉ xử lý đoạn được cung cấp.

            **ĐOẠN KỊCH BẢN:**
            ---
            ${chunk}
            ---

            **Hướng dẫn:**
            1. Chia nhỏ ĐOẠN KỊCH BẢN thành các cảnh, bảo toàn mạch truyện.
            2. Chuyển thể mọi hành động, lời thoại và lời dẫn quan trọng thành một cảnh riêng biệt.
            3. Chỉ trả về MỘT đối tượng JSON hợp lệ duy nhất tuân thủ nghiêm ngặt schema được cung cấp, chứa một mảng các cảnh bạn đã tạo cho đoạn này. Đảm bảo tất cả văn bản đều bằng ${language}.
        `,
        promoTask: (masterScript: string, language: string) => `
            **Nhiệm vụ của bạn:**
            Bạn là một Chuyên gia Tiếp thị AI. Đọc TOÀN BỘ Kịch bản Gốc dưới đây và tạo ra nội dung quảng cáo hấp dẫn cho nó.

            **Kịch bản Gốc (Bối cảnh đầy đủ):**
            ---
            ${masterScript}
            ---

            **Hướng dẫn:**
            Tạo các tài liệu quảng cáo bằng ${language} dựa trên câu chuyện tổng thể.
            Chỉ trả về MỘT đối tượng JSON hợp lệ duy nhất tuân thủ nghiêm ngặt schema được cung cấp cho nội dung quảng cáo.
        `
    }
};

const getPrompts = (language: string) => {
    return promptLocalizations[language] || promptLocalizations['English'];
};


// --- END: Voice & Localization Engine ---


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
            const failedKey = apiKeys[(keyIndex - 1 + apiKeys.length) % apiKeys.length];
            apiKeyStatuses.set(failedKey, 'failed');
            console.error(`API call failed with key index ${(keyIndex - 1 + apiKeys.length) % apiKeys.length} (${failedKey}):`, error);
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
            // FIX: Add a safeguard. If response.text is undefined for any reason,
            // return an empty string to prevent downstream crashes.
            return response.text || '';
        } catch (error) {
            const failedKey = apiKeys[(keyIndex - 1 + apiKeys.length) % apiKeys.length];
            apiKeyStatuses.set(failedKey, 'failed');
            console.error(`API call failed with key index ${(keyIndex - 1 + apiKeys.length) % apiKeys.length} (${failedKey}):`, error);
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
    const prompts = getPrompts(userInput.language);
    const availableVoices = getAvailableVoices(userInput.language).join(', ');
    const prompt = prompts.generateCharacterProfile(userInput, availableVoices);
    
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

    const prompts = getPrompts(userInput.language);
    const prompt = prompts.generateMasterScript(userInput, characterProfile, targetWordCount, minWordCount, maxWordCount, wordsPerSecond);

    return generateText(prompt, apiKeys);
};


export const breakdownScriptIntoScenes = async (userInput: UserInput, characterProfile: CharacterProfile, masterScript: string, apiKeys: string[]): Promise<StoryboardData> => {
    const prompts = getPrompts(userInput.language);
    
    // Step 1: Define "The Director's Bible" - the single source of truth for consistency.
    const directorsBible = prompts.directorsBible(userInput, characterProfile);

    // Schemas for API calls
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
            ${prompts.breakdownTask(chunk, userInput.language)}
        `;
        type SceneResponse = { scenes: Scene[] };
        return generateJson<SceneResponse>(prompt, scenesSchema, apiKeys);
    });

    // Step 4: Generate promotional content in parallel using the full script
    const promoPrompt = `
        ${directorsBible}
        ${prompts.promoTask(masterScript, userInput.language)}
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
    
    // Step 6: Post-process scenes to map friendly voice names to technical voice models
    const voiceMapForLanguage = voiceModelMap[userInput.language] || voiceModelMap['English'];
    const narratorName = userInput.language === 'Vietnamese' ? 'NGƯỜI DẪN CHUYỆN' : 'NARRATOR';

    const processedScenes = allScenes.map(scene => {
        const prompt = scene.scene_prompt_json as any;
        const speaker = prompt?.dialogue_character;

        if (speaker && prompt.voice_model) {
            let friendlyVoice = prompt.voice_model; // The AI should have picked the right one
            
            // In case the AI hallucinates a name, let's find the correct one from the profile
            if (speaker.toUpperCase() === narratorName) {
                friendlyVoice = characterProfile.narratorVoice;
            } else {
                const char = characterProfile.characters.find(c => c.name === speaker);
                if (char) {
                    friendlyVoice = char.voice;
                }
            }
            
            const technicalVoice = voiceMapForLanguage[friendlyVoice] || friendlyVoice;
            prompt.voice_model = technicalVoice;
        }

        return { ...scene, scene_prompt_json: prompt };
    });


    return {
        scenes: processedScenes,
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
            const failedKey = apiKeys[(keyIndex - 1 + apiKeys.length) % apiKeys.length];
            apiKeyStatuses.set(failedKey, 'failed');
            console.error(`Image generation failed with key index ${(keyIndex - 1 + apiKeys.length) % apiKeys.length} (${failedKey}):`, error);
            lastError = error instanceof Error ? error : new Error(String(error));
            if (keyIndex === initialKeyIndex) {
                 break;
            }
        }
    }
    
    console.error("All API keys failed for image generation.", lastError);
    throw new Error("The image generation service is currently unavailable or all keys have reached their quota.");
};