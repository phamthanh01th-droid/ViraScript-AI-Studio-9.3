# ViraScript AI Studio 9.5 - The AI Director's Workbench (Bàn Làm Việc Của Đạo Diễn AI)

## Tiếng Việt

### 🇻🇳 Giới Thiệu

**ViraScript AI Studio** là một ứng dụng web mang tính cách mạng, hoạt động như một bàn làm việc của đạo diễn AI. Thay vì chỉ tạo ra một video cuối cùng, công cụ này trao quyền cho người dùng bằng cách biến ý tưởng của họ thành một kịch bản phân cảnh (storyboard) tương tác, có cấu trúc chuyên nghiệp. Mỗi cảnh trong storyboard là một đơn vị độc lập, chứa đầy đủ prompt hình ảnh, lời thoại, và một prompt JSON chuẩn hóa sẵn sàng để sử dụng với các mô hình tạo video như VEO.

Mục tiêu chính là cho phép người dùng toàn quyền kiểm soát sáng tạo, từ việc tinh chỉnh nhân vật đến việc tạo ra các clip ngắn cho từng cảnh riêng lẻ, đảm bảo sự nhất quán và chất lượng trên toàn bộ câu chuyện.

### ✨ Tính Năng Nổi Bật (Phiên bản 9.5)

1.  **Hỗ Trợ Đa Ngôn Ngữ Nâng Cao (Tiếng Việt):**
    *   **Bản Địa Hóa Hoàn Toàn:** Hệ thống giờ đây sử dụng các prompt chỉ dẫn được viết hoàn toàn bằng Tiếng Việt khi người dùng chọn ngôn ngữ Tiếng Việt. Điều này giúp AI hiểu sâu sắc ngữ cảnh và yêu cầu, từ đó tạo ra kịch bản Tiếng Việt tự nhiên, chính xác và chất lượng hơn rất nhiều.
    *   **Bảo Toàn Chất Lượng Tiếng Anh:** Luồng xử lý cho Tiếng Anh được giữ nguyên vẹn và không bị ảnh hưởng, đảm bảo chất lượng tuyệt vời vốn có.

2.  **Quản Lý API Key Nâng Cao (Bắt Buộc):**
    *   **Bắt buộc nhập Key:** Ứng dụng yêu cầu người dùng phải cung cấp API Key của Google AI Studio để hoạt động. Đây là bước đầu tiên và bắt buộc.
    *   **Hỗ trợ nhiều Key:** Cho phép nhập một hoặc nhiều API key, phân tách bằng dấu phẩy hoặc dòng mới. Càng nhiều key, giới hạn sử dụng càng cao.
    *   **Tự động Xoay Vòng (Round-Robin):** Hệ thống thông minh tự động xoay vòng qua các key được cung cấp cho mỗi yêu cầu mới, giúp phân bổ đều tải và tránh dùng cạn hạn mức của một key duy nhất.
    *   **Tự động Chuyển Đổi (Failover):** Nếu một key bị lỗi (hết hạn mức, không hợp lệ), hệ thống sẽ tự động thử lại yêu cầu với key tiếp theo trong danh sách, đảm bảo quá trình sáng tạo không bị gián đoạn.

3.  **Cỗ Máy Nhất Quán (Consistency Engine):**
    *   **Nhân Vật & Bối Cảnh (Consistent Character):** Giai đoạn **"Review & Refine"** là trái tim của sự nhất quán. Người dùng có thể chỉnh sửa hoặc tạo lại mô tả chi tiết về ngoại hình, trang phục của nhân vật và bối cảnh. Những mô tả này sẽ được "khóa lại" và tuân thủ nghiêm ngặt trong mọi prompt tạo cảnh, đảm bảo nhân vật giữ nguyên vẹn trên toàn bộ video.
    *   **Giọng Nói Nhất Quán & Chuẩn Hóa (Consistent & Standardized Voice):** Tại bước "Review & Refine", người dùng có thể "tuyển vai" giọng nói cho người dẫn chuyện và từng nhân vật. Quan trọng hơn, file JSON đầu ra giờ đây tuân thủ nghiêm ngặt tài liệu mới nhất của Gemini API: sử dụng trường `voice_name` với các tên giọng nói chính thức (ví dụ: 'Zephyr', 'Puck') từ model `gemini-2.5-flash-preview-tts` và trường `speaker` để xác định người nói. Điều này đảm bảo tính tương thích tuyệt đối và giúp các công cụ như VEO 3 nhận diện chính xác yêu cầu chuyển đổi giọng nói.
    *   **Phong Cách Video (Upgraded!):** **Phong cách Video** đã chọn được áp dụng nhất quán một cách **cực kỳ nghiêm ngặt** cho mọi cảnh, từ bố cục, ánh sáng đến màu sắc, tạo ra một bộ phim có thẩm mỹ đồng nhất.

4.  **Cấu trúc Kịch bản Chuyên nghiệp:**
    *   **Bước 1 - Sáng Tác Kịch Bản Gốc:** AI viết kịch bản theo một **cấu trúc 5 phần chuyên nghiệp** (Mở đầu, Bối cảnh, Phân tích, Kết luận, Kêu gọi hành động), đảm bảo video của bạn giữ chân khán giả tốt hơn và tuân thủ **nghiêm ngặt** thời lượng yêu cầu.
    *   **Bước 2 - Phân Cảnh Thông Minh:** AI phân tích kịch bản gốc và **chuyển thể** từng chi tiết thành các JSON prompt riêng biệt, bám sát tuyệt đối vào mạch truyện.
    *   **Chỉ Dẫn Máy Quay Chuyên Nghiệp:** Mỗi JSON prompt bao gồm một trường `camera_shot` (ví dụ: "Close-up shot," "Wide establishing shot"), cung cấp những chỉ dẫn điện ảnh chuyên nghiệp.

5.  **Kịch Bản Phân Cảnh Tương Tác (Cải tiến UI):**
    *   **Cấu Trúc 3 Hồi:** AI phác thảo câu chuyện với cấu trúc 3 hồi kinh điển, trình bày dưới dạng các **tab** rõ ràng (Act 1, Act 2, Act 3).
    *   **Thẻ Cảnh (Scene Card):** Mỗi cảnh được hiển thị trên một thẻ trực quan. Nút "Generate Image" đã được thay thế bằng nút **"Image Prompt"**, giúp người dùng xem và sao chép ngay lập tức prompt tạo hình ảnh hoàn chỉnh, tập trung vào việc cung cấp nguyên liệu thô.
    *   **Prompt Sẵn Sàng Sử Dụng:** Mỗi thẻ có nút **"JSON Prompt"** và **"Image Prompt"** với icon sao chép nhỏ gọn để lấy ngay lập tức các prompt đã được cấu trúc hoàn chỉnh.

6.  **Tổng Quan Kịch Bản & Nội Dung Quảng Bá:**
    *   Cung cấp mục **"Full Script Overview"** có thể mở rộng để xem toàn bộ kịch bản.
    *   AI tự động tạo nội dung quảng bá tối ưu cho **YouTube**, **Facebook**, và **TikTok**, bao gồm tiêu đề, mô tả, hashtag, và prompt tạo ảnh thumbnail.

### 🚀 Luồng Hoạt Động

1.  **Nhập API Key:** Người dùng cung cấp một hoặc nhiều API key của Google AI Studio.
2.  **Khởi tạo Ý tưởng (Input Form):** Người dùng nhập chủ đề, chọn thể loại kênh, các phong cách, thời lượng, ngôn ngữ và tỷ lệ khung hình.
3.  **Duyệt & Tinh Chỉnh (Character Review):** AI đề xuất nhân vật/bối cảnh. Người dùng chỉnh sửa hoặc tạo lại để "khóa" tính nhất quán về hình ảnh và giọng nói (nay đã có lựa chọn giọng Tiếng Việt).
4.  **Xem Kịch Bản (Storyboard):** Giao diện chính hiển thị toàn bộ kịch bản. Người dùng có thể xem chi tiết từng cảnh, sao chép prompt hình ảnh và JSON.

---

## English

### 🇬🇧 Overview

**ViraScript AI Studio** is a revolutionary web application that functions as an AI Director's Workbench. Instead of merely generating a final video, this tool empowers users by transforming their ideas into a professionally structured, interactive storyboard. Each scene on the storyboard is an independent unit, complete with a visual prompt, dialogue, and a standardized JSON prompt ready for use with video generation models like VEO.

The primary goal is to give users full creative control, from refining characters to generating short clips for individual scenes, ensuring consistency and quality across the entire narrative.

### ✨ Key Features (Version 9.5)

1.  **Advanced Multi-Language Support (Vietnamese):**
    *   **Full Localization:** The system now uses fully localized, native prompts when a user selects Vietnamese. This allows the AI to deeply understand the context and requests, resulting in much more natural, accurate, and high-quality Vietnamese scripts.
    *   **Preserved English Quality:** The English processing pipeline remains untouched and separate, ensuring its existing excellent performance is not affected.

2.  **Advanced API Key Management (Required):**
    *   **Mandatory Key Input:** The application requires users to provide their own Google AI Studio API Keys to operate. This is the first and mandatory step.
    *   **Multi-Key Support:** Accepts one or more API keys, separated by commas or new lines. More keys mean higher usage limits.
    *   **Round-Robin Rotation:** The system intelligently rotates through the provided keys for each new request, distributing the load and preventing a single key from being exhausted.
    *   **Failover Mechanism:** If a key fails, the system automatically retries the request with the next key, ensuring an uninterrupted creative workflow.

3.  **The Consistency Engine:**
    *   **Consistent Character & Setting:** The **"Review & Refine"** stage is the heart of consistency. Users can edit or regenerate detailed descriptions of character appearance, wardrobe, and setting. These descriptions are then "locked in" and strictly enforced in every scene prompt.
    *   **Consistent & Standardized Voice:** In the "Review & Refine" stage, users can "cast" voices for the Narrator and characters. More importantly, the output JSON now strictly adheres to the latest Gemini API documentation: it uses the `voice_name` field with official voice names (e.g., 'Zephyr', 'Puck') from the `gemini-2.5-flash-preview-tts` model and the `speaker` field to identify the speaker. This ensures maximum compatibility and allows tools like VEO 3 to correctly interpret the voice generation request.
    *   **Consistent Video Style (Upgraded!):** The selected **Video Style** is now **critically enforced** across every scene's cinematography—from composition and lighting to color palette—creating a film with a unified aesthetic.

4.  **Professional Script Structure:**
    *   **Step 1 - Master Script Generation:** The AI writes scripts following a professional **5-part structure (Hook, Context, Analysis, Conclusion, CTA)**, ensuring better audience retention and strictly adhering to the requested duration.
    *   **Step 2 - Intelligent Scene Breakdown:** The AI analyzes the master script and **translates** every detail into individual JSON prompts, ensuring perfect alignment with the narrative.
    *   **Professional Camera Shots:** Each JSON prompt includes a `camera_shot` field (e.g., "Close-up shot," "Wide establishing shot").

5.  **Interactive Storyboard (UI Improved):**
    *   **3-Act Structure:** The AI outlines a story with the classic 3-act structure, presented in clear **tabs**.
    *   **Scene Cards:** Each scene is a visual card. The "Generate Image" button has been replaced with an **"Image Prompt"** button, allowing users to instantly view and copy the complete image prompt, focusing on providing raw, high-quality materials.
    *   **Ready-to-Use Prompts:** Each card features **"JSON Prompt"** and **"Image Prompt"** buttons with compact copy icons to instantly grab the fully structured prompts.

6.  **Full Script Overview & Promotional Content:**
    *   Features an expandable **"Full Script Overview"** section to view the entire script.
    *   The AI automatically generates promotional content optimized for **YouTube**, **Facebook**, and **TikTok**, including titles, descriptions, hashtags, and a thumbnail prompt.

### 🚀 User Workflow

1.  **API Key Input:** The user provides one or more Google AI Studio API keys.
2.  **Idea Input (Input Form):** The user enters their topic, selects a channel type, styles, duration, language, and aspect ratio.
3.  **Review & Refine:** The AI proposes characters/settings. The user edits or regenerates them to "lock in" visual and audio consistency (now with Vietnamese voice options).
4.  **Storyboard View:** The main interface displays the full script. The user can review scene details and copy the image and JSON prompts.