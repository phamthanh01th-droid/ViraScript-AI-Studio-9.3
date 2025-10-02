# ViraScript AI Studio 9.3 - The AI Director's Workbench (Bàn Làm Việc Của Đạo Diễn AI)

## Tiếng Việt

### 🇻🇳 Giới Thiệu

**ViraScript AI Studio** là một ứng dụng web mang tính cách mạng, hoạt động như một bàn làm việc của đạo diễn AI. Thay vì chỉ tạo ra một video cuối cùng, công cụ này trao quyền cho người dùng bằng cách biến ý tưởng của họ thành một kịch bản phân cảnh (storyboard) tương tác, có cấu trúc chuyên nghiệp. Mỗi cảnh trong storyboard là một đơn vị độc lập, chứa đầy đủ prompt hình ảnh, lời thoại, và một prompt JSON chuẩn hóa sẵn sàng để sử dụng với các mô hình tạo video như VEO.

Mục tiêu chính là cho phép người dùng toàn quyền kiểm soát sáng tạo, từ việc tinh chỉnh nhân vật đến việc tạo ra các clip ngắn cho từng cảnh riêng lẻ, đảm bảo sự nhất quán và chất lượng trên toàn bộ câu chuyện.

### ✨ Tính Năng Nổi Bật

1.  **Quản Lý API Key Nâng Cao (Bắt Buộc):**
    *   **Bắt buộc nhập Key:** Ứng dụng yêu cầu người dùng phải cung cấp API Key của Google AI Studio để hoạt động. Đây là bước đầu tiên và bắt buộc.
    *   **Hỗ trợ nhiều Key:** Cho phép nhập một hoặc nhiều API key, phân tách bằng dấu phẩy hoặc dòng mới. Càng nhiều key, giới hạn sử dụng càng cao.
    *   **Tự động Xoay Vòng (Round-Robin):** Hệ thống thông minh tự động xoay vòng qua các key được cung cấp cho mỗi yêu cầu mới, giúp phân bổ đều tải và tránh dùng cạn hạn mức của một key duy nhất.
    *   **Tự động Chuyển Đổi (Failover):** Nếu một key bị lỗi (hết hạn mức, không hợp lệ), hệ thống sẽ tự động thử lại yêu cầu với key tiếp theo trong danh sách, đảm bảo quá trình sáng tạo không bị gián đoạn.

2.  **Luồng Nhập Liệu Thông Minh:**
    *   **Lựa chọn Thể loại Kênh:** Chọn từ 15 thể loại kênh YouTube phổ biến (Phân tích, Vlog, Review...) để AI tạo ra kịch bản với cấu trúc và văn phong phù hợp nhất với kênh của bạn.
    *   **Đơn Giản Hóa:** Bắt đầu chỉ với các thông tin cốt lõi: **Chủ đề**, **Phong cách Video**, **Thời lượng**, **Ngôn ngữ**, và **Tỷ lệ khung hình**.
    *   **Gợi ý bằng AI:** AI tự động gợi ý **Phong cách Hình ảnh** và **Văn phong** phù hợp nhất ngay sau khi bạn chọn **Phong cách Video**, giúp định hình ý tưởng một cách nhanh chóng.

3.  **Cỗ Máy Nhất Quán (Consistency Engine):**
    *   **Nhân Vật & Bối Cảnh (Consistent Character):** Giai đoạn **"Review & Refine"** là trái tim của sự nhất quán. Người dùng có thể chỉnh sửa hoặc tạo lại mô tả chi tiết về ngoại hình, trang phục của nhân vật và bối cảnh. Những mô tả này sẽ được "khóa lại" và tuân thủ nghiêm ngặt trong mọi prompt tạo cảnh, đảm bảo nhân vật giữ nguyên vẹn trên toàn bộ video.
    *   **Giọng Nói Nhất Quán (Consistent Voice) (Mới!):** Tại bước "Review & Refine", người dùng có thể "tuyển vai" giọng nói cho người dẫn chuyện (Narrator) và từng nhân vật từ một danh sách có sẵn. Giọng nói được chọn sẽ được khóa lại và sử dụng nhất quán trong mọi cảnh, đảm bảo trải nghiệm âm thanh chuyên nghiệp, đồng nhất.
    *   **Phong Cách Video (Nâng Cấp!):** **Phong cách Video** đã chọn được áp dụng nhất quán một cách **cực kỳ nghiêm ngặt** cho mọi cảnh, từ bố cục, ánh sáng đến màu sắc, tạo ra một bộ phim có thẩm mỹ đồng nhất và loại bỏ sự sai lệch.

4.  **Cấu trúc Kịch bản Chuyên nghiệp:**
    *   **Bước 1 - Sáng Tác Kịch Bản Gốc:** AI giờ đây viết kịch bản theo một **cấu trúc 5 phần chuyên nghiệp** (Mở đầu hấp dẫn, Bối cảnh, Phân tích sâu, Kết luận & Gợi mở, Kêu gọi hành động), đảm bảo video của bạn giữ chân khán giả tốt hơn. Kịch bản được xây dựng để tuân thủ **nghiêm ngặt** thời lượng người dùng yêu cầu.
    *   **Bước 2 - Phân Cảnh Thông Minh:** Sau khi có kịch bản gốc, AI sẽ phân tích kịch bản đó và **chuyển thể** từng chi tiết thành các JSON prompt riêng biệt. Điều này đảm bảo mỗi cảnh đều bám sát tuyệt đối vào mạch truyện.
    *   **Chỉ Dẫn Máy Quay Chuyên Nghiệp:** Mỗi JSON prompt giờ đây còn bao gồm một trường `camera_shot` (ví dụ: "Close-up shot," "Wide establishing shot"), cung cấp những chỉ dẫn điện ảnh chuyên nghiệp.

5.  **Kịch Bản Phân Cảnh Tương Tác:**
    *   **Cấu Trúc 3 Hồi:** AI phác thảo một câu chuyện hoàn chỉnh với cấu trúc 3 hồi kinh điển, được trình bày dưới dạng các **tab** rõ ràng (Act 1, Act 2, Act 3).
    *   **Thẻ Cảnh (Scene Card):** Mỗi cảnh được hiển thị dưới dạng thẻ trực quan, cho phép người dùng **tạo ảnh xem trước** (image preview) để hình dung rõ hơn về cảnh đó.
    *   **Prompt Sẵn Sàng Sử Dụng:** Mỗi thẻ có nút **"JSON Prompt"** để xem chi tiết và nút **icon sao chép** nhỏ gọn để lấy ngay lập tức prompt JSON đã được cấu trúc hoàn chỉnh.

6.  **Tổng Quan Kịch Bản & Nội Dung Quảng Bá:**
    *   Cung cấp một mục **"Full Script Overview"** có thể mở rộng, cho phép xem toàn bộ kịch bản dưới dạng văn xuôi (Story View) hoặc dạng kịch bản truyền thống (Script View).
    *   AI tự động tạo ra các nội dung quảng bá tối ưu cho **YouTube**, **Facebook**, và **TikTok**, bao gồm tiêu đề, mô tả, hashtag, và cả prompt để tạo ảnh thumbnail thu hút.

### 🚀 Luồng Hoạt Động

1.  **Nhập API Key:** Người dùng cung cấp một hoặc nhiều API key của Google AI Studio.
2.  **Khởi tạo Ý tưởng (Input Form):** Người dùng nhập chủ đề, chọn thể loại kênh, các phong cách, thời lượng, ngôn ngữ và tỷ lệ khung hình.
3.  **Duyệt & Tinh Chỉnh (Character Review):** AI đề xuất nhân vật/bối cảnh. Người dùng chỉnh sửa hoặc tạo lại để "khóa" tính nhất quán về hình ảnh và giọng nói.
4.  **Xem Kịch Bản (Storyboard):** Giao diện chính hiển thị toàn bộ kịch bản. Người dùng có thể xem chi tiết từng cảnh, tạo ảnh xem trước và sao chép JSON prompt.

---

## English

### 🇬🇧 Overview

**ViraScript AI Studio** is a revolutionary web application that functions as an AI Director's Workbench. Instead of merely generating a final video, this tool empowers users by transforming their ideas into a professionally structured, interactive storyboard. Each scene on the storyboard is an independent unit, complete with a visual prompt, dialogue, and a standardized JSON prompt ready for use with video generation models like VEO.

The primary goal is to give users full creative control, from refining characters to generating short clips for individual scenes, ensuring consistency and quality across the entire narrative.

### ✨ Key Features

1.  **Advanced API Key Management (Required):**
    *   **Mandatory Key Input:** The application requires users to provide their own Google AI Studio API Keys to operate. This is the first and mandatory step.
    *   **Multi-Key Support:** Accepts one or more API keys, separated by commas or new lines. More keys mean higher usage limits.
    *   **Round-Robin Rotation:** The system intelligently rotates through the provided keys for each new request, distributing the load and preventing a single key from being exhausted.
    *   **Failover Mechanism:** If a key fails (due to quota limits, invalidity, etc.), the system automatically retries the request with the next key in the list, ensuring an uninterrupted creative workflow.

2.  **Intelligent Input Flow:**
    *   **Channel Type Selection:** Choose from 15 popular YouTube channel genres (e.g., Commentary, Vlog, Review) to have the AI generate scripts with the most appropriate structure and tone for your channel's niche.
    *   **Simplified Start:** Begin with just the core inputs: **Topic**, **Video Style**, **Duration**, **Language**, and **Aspect Ratio**.
    *   **AI-Powered Suggestions:** The AI automatically suggests the most complementary **Image Style** and **Writing Style** as soon as you select a **Video Style**, helping to rapidly shape your creative vision.

3.  **The Consistency Engine:**
    *   **Consistent Character & Setting:** The **"Review & Refine"** stage is the heart of consistency. Users can edit or regenerate detailed descriptions of character appearance, wardrobe, and setting. These descriptions are then "locked in" and strictly enforced in every scene prompt, guaranteeing characters remain visually consistent.
    *   **Consistent Voice (New!):** During the "Review & Refine" stage, users can "cast" voices for the Narrator and each character from a predefined list. This selected voice is locked in and applied consistently across all relevant scenes for a professional, uniform audio experience.
    *   **Consistent Video Style (Upgraded!):** The selected **Video Style** is now **critically enforced** across every scene's cinematography—from composition and lighting to color palette—creating a film with a unified aesthetic and eliminating stylistic deviations.

4.  **Professional Script Structure:**
    *   **Step 1 - Master Script Generation:** The AI now writes scripts following a professional **5-part structure (Hook, Context, Deep Analysis, Conclusion & Teaser, Call to Action)**, ensuring your videos have better audience retention. The script is engineered to **strictly adhere** to the user's requested duration.
    *   **Step 2 - Intelligent Scene Breakdown:** Once the master script is generated, the AI analyzes it and **translates** every detail into individual JSON prompts, ensuring perfect alignment with the narrative.
    *   **Professional Camera Shots:** Each JSON prompt includes a `camera_shot` field (e.g., "Close-up shot," "Wide establishing shot") for more engaging and visually diverse videos.

5.  **Interactive Storyboard:**
    *   **3-Act Structure:** The AI outlines a complete story with the classic 3-act structure, presented in clear **tabs** (Act 1, Act 2, Act 3).
    *   **Scene Cards:** Each scene is displayed as a visual card, allowing the user to **generate a preview image** to better visualize the shot.
    *   **Ready-to-Use Prompts:** Each card features a **"JSON Prompt"** button for full details and a compact **copy icon** to instantly grab the fully structured JSON prompt.

6.  **Full Script Overview & Promotional Content:**
    *   Features an expandable **"Full Script Overview"** section to view the entire script in either a novel-like "Story View" or a traditional "Script View".
    *   The AI automatically generates promotional content optimized for **YouTube**, **Facebook**, and **TikTok**, including titles, descriptions, hashtags, and even a prompt for creating a compelling thumbnail.

### 🚀 User Workflow

1.  **API Key Input:** The user provides one or more Google AI Studio API keys.
2.  **Idea Input (Input Form):** The user enters their topic, selects a channel type, styles, duration, language, and aspect ratio.
3.  **Review & Refine:** The AI proposes characters/settings. The user edits or regenerates them to "lock in" visual and audio consistency.
4.  **Storyboard View:** The main interface displays the full script. The user can review scene details, generate preview images, and copy the JSON prompts.