
import React, { useState, useMemo, useEffect } from 'react';
import { UserInput, AspectRatio } from '../types';
import { MagicIcon } from './icons/MagicIcon';
import { getStyleSuggestions } from '../services/geminiService';

interface InputFormProps {
  onSubmit: (data: UserInput) => void;
  apiKeys: string[];
}

const channelTypeOptions: { en: string; vi: string }[] = [
    { en: 'Commentary/Narrative', vi: 'Phân tích & kể chuyện' },
    { en: 'Personal Vlog / Daily Life', vi: 'Vlog cá nhân / Daily life' },
    { en: 'Product Review & Comparison', vi: 'Review & so sánh sản phẩm' },
    { en: 'Short Educational (Explain Like I’m 5)', vi: 'Giáo dục ngắn gọn (Explain like I’m 5)' },
    { en: 'How-to / Tutorial / DIY', vi: 'How-to / Tutorial / DIY' },
    { en: 'Niche News Summary', vi: 'Tin tức tổng hợp / Thời sự ngách' },
    { en: 'Interview / Video Podcast', vi: 'Phỏng vấn / Podcast video' },
    { en: 'Reaction Video', vi: 'Reaction / Phản ứng' },
    { en: 'Gaming', vi: 'Gaming' },
    { en: 'ASMR / Chill / Ambient', vi: 'ASMR / Chill / Ambient' },
    { en: 'Compilation / Highlights', vi: 'Compilation / Highlight cắt ghép' },
    { en: 'Niche Expertise / Deep Dive', vi: 'Chuyên môn sâu / Niche Expertise' },
    { en: 'Comedy Sketch / Meme', vi: 'Shorts hài / Sketch / Meme' },
    { en: 'Fitness & Minimalist Lifestyle', vi: 'Fitness & Lifestyle tối giản' },
    { en: 'Mini Documentary / Long-form Docu', vi: 'Kênh tài liệu mini / Long-form docu' }
];

const styleOptions: { en: string; vi: string }[] = [
  { en: '2D Animation', vi: 'Hoạt hình 2D' },
  { en: '3D Animation', vi: 'Hoạt hình 3D' },
  { en: 'Abstract', vi: 'Trừu tượng' },
  { en: 'Anime', vi: 'Anime' },
  { en: 'Brand Storytelling Video', vi: 'Video Kể Chuyện Thương Hiệu' },
  { en: 'Casual & Conversational', vi: 'Thân mật & Đời thường' },
  { en: 'Cinematic', vi: 'Điện ảnh' },
  { en: 'Cinematic 8K Realism', vi: 'Chân thực 8K Điện ảnh' },
  { en: 'Cinematic Short Film', vi: 'Phim Ngắn Điện ảnh' },
  { en: 'Comedy Skit', vi: 'Tiểu phẩm Hài' },
  { en: 'Comic Book', vi: 'Truyện Tranh' },
  { en: 'Cyberpunk', vi: 'Cyberpunk' },
  { en: 'DIY/Crafting Tutorial', vi: 'Hướng dẫn Tự làm (DIY)' },
  { en: 'Documentary', vi: 'Tài liệu' },
  { en: 'Documentary (Vox)', vi: 'Tài liệu (phong cách Vox)' },
  { en: 'Educational & Clear', vi: 'Giáo dục & Rõ ràng' },
  { en: 'Educational Animation (Kurzgesagt)', vi: 'Hoạt hình Giáo dục (phong cách Kurzgesagt)' },
  { en: 'Emotional Public Service Announcement (PSA)', vi: 'Thông điệp Cộng đồng (PSA) Cảm xúc' },
  { en: 'Epic Fantasy (Lord of the Rings)', vi: 'Sử thi Kỳ ảo (phong cách Chúa Nhẫn)' },
  { en: 'Epic Movie Trailer', vi: 'Trailer Phim Sử thi' },
  { en: 'Fantasy', vi: 'Kỳ ảo' },
  { en: 'Fast-Paced Explainer (Johnny Harris)', vi: 'Giải thích Tốc độ nhanh (phong cách Johnny Harris)' },
  { en: 'First-person Storytelling', vi: 'Kể chuyện Ngôi thứ nhất' },
  { en: 'Formal & Professional', vi: 'Trang trọng & Chuyên nghiệp' },
  { en: 'Gaming Livestream Highlight', vi: 'Tổng hợp Livestream Game' },
  { en: 'Gothic', vi: 'Gothic' },
  { en: 'Historical', vi: 'Lịch sử' },
  { en: 'Horror', vi: 'Kinh dị' },
  { en: 'Inspirational & Motivational', vi: 'Truyền cảm hứng & Động lực' },
  { en: 'Journalistic & Objective', vi: 'Báo chí & Khách quan' },
  { en: 'Manga (Japanese)', vi: 'Manga (Nhật Bản)' },
  { en: 'Manhwa (Korean)', vi: 'Manhwa (Hàn Quốc)' },
  { en: 'Minimalist', vi: 'Tối giản' },
  { en: 'Minimalist & Clean', vi: 'Tối giản & Sạch sẽ' },
  { en: 'Music Video', vi: 'Video Âm nhạc' },
  { en: 'Nature', vi: 'Thiên nhiên' },
  { en: 'Noir', vi: 'Phim Đen (Noir)' },
  { en: 'Noir Film Look', vi: 'Phong cách Phim Đen' },
  { en: 'Novel', vi: 'Tiểu thuyết' },
  { en: 'Pixar Animation', vi: 'Hoạt hình Pixar' },
  { en: 'Poetic & Artistic', vi: 'Thơ ca & Nghệ thuật' },
  { en: 'Pop Art', vi: 'Nghệ thuật Pop' },
  { en: 'Product Commercial', vi: 'Quảng cáo Sản phẩm' },
  { en: 'Satirical & Ironic', vi: 'Châm biếm & Mỉa mai' },
  { en: 'Sci-Fi', vi: 'Khoa học Viễn tưởng' },
  { en: 'Steampunk', vi: 'Steampunk' },
  { en: 'Surreal', vi: 'Siêu thực' },
  { en: 'Suspenseful & Dramatic', vi: 'Hồi hộp & Kịch tính' },
  { en: 'Synthwave/Vaporwave', vi: 'Synthwave/Vaporwave' },
  { en: 'Tech Review (MKBHD)', vi: 'Đánh giá Công nghệ (phong cách MKBHD)' },
  { en: 'Urban', vi: 'Đô thị' },
  { en: 'Vintage', vi: 'Cổ điển (Vintage)' },
  { en: 'Vintage/Retro Film', vi: 'Phim Cổ điển/Retro' },
  { en: 'Vlog', vi: 'Vlog' },
  { en: 'Vlog Style (Casey Neistat)', vi: 'Phong cách Vlog (Casey Neistat)' },
  { en: 'Watercolor Painting', vi: 'Tranh màu nước' },
  { en: 'Wes Anderson Symmetry', vi: 'Đối xứng Wes Anderson' },
  { en: 'Witty & Humorous', vi: 'Dí dỏm & Hài hước' }
];

const languageOptions: Record<string, string> = {
  'English': 'English',
  'Vietnamese': 'Tiếng Việt',
  'Chinese': '中文',
  'Japanese': '日本語',
  'French': 'Français'
};


const InputForm: React.FC<InputFormProps> = ({ onSubmit, apiKeys }) => {
  const [formData, setFormData] = useState<UserInput>({
    topic: 'A cat detective solving the mystery of the missing tuna in a noir city.',
    channelType: 'Commentary/Narrative',
    videoStyle: '',
    imageStyle: '',
    writingStyle: '',
    durationInSeconds: 90,
    language: 'English',
    aspectRatio: '16:9' as AspectRatio,
  });
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    if (formData.videoStyle && apiKeys && apiKeys.length > 0) {
      const suggestStyles = async () => {
        setIsSuggesting(true);
        try {
          const styleOptionsEn = styleOptions.map(s => s.en);
          const suggestions = await getStyleSuggestions(
            formData.videoStyle,
            styleOptionsEn,
            styleOptionsEn,
            apiKeys
          );
          if (suggestions.imageStyle && suggestions.writingStyle) {
             setFormData(prev => ({
              ...prev,
              imageStyle: suggestions.imageStyle,
              writingStyle: suggestions.writingStyle
            }));
          }
        } catch (error) {
          console.error("Failed to get style suggestions:", error);
        } finally {
          setIsSuggesting(false);
        }
      };
      suggestStyles();
    } else {
        setFormData(prev => ({ ...prev, imageStyle: '', writingStyle: '' }));
    }
  }, [formData.videoStyle, apiKeys]);


  const formatDuration = (seconds: number): string => {
    const totalSeconds = seconds;
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  const displayDuration = useMemo(() => formatDuration(formData.durationInSeconds), [formData.durationInSeconds]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'durationInSeconds') {
        setFormData(prev => ({ ...prev, durationInSeconds: parseInt(value, 10) }));
    } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
    
  const handleRatioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, aspectRatio: e.target.value as AspectRatio }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderSelect = (
    name: keyof Omit<UserInput, 'aspectRatio' | 'durationInSeconds' | 'topic'>, 
    label: string, 
    options: typeof styleOptions | Record<string,string>, 
    isLoading: boolean = false
) => {
  const isSuggestionField = name === 'imageStyle' || name === 'writingStyle';
  const isDisabled = isLoading || (isSuggestionField && !formData.videoStyle);

  return (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <select
            id={name}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            disabled={isDisabled}
            required={name === 'videoStyle' || name === 'channelType'}
            className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-wait"
        >
            <option value="" disabled>
                {isLoading ? 'AI is suggesting...' : 'Select an option...'}
            </option>
            {Array.isArray(options) && 'en' in options[0]
              ? (options as typeof styleOptions).map(opt => <option key={opt.en} value={opt.en}>{`${opt.en} / ${opt.vi}`}</option>)
              : Object.entries(options).map(([value, text]) => <option key={value} value={value}>{text}</option>)
            }
        </select>
    </div>
  );
};


  return (
    <div className="max-w-2xl mx-auto bg-slate-800/50 p-8 rounded-2xl shadow-2xl border border-slate-700">
      <h2 className="text-3xl font-bold text-center mb-2 text-white">Bring Your Idea to Life</h2>
      <p className="text-center text-slate-400 mb-8">Enter the details below, and our AI Director will get to work.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-slate-300 mb-2">
            Topic / Idea
          </label>
          <div className="w-full bg-slate-900 border border-slate-700 rounded-md transition-all focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
            <textarea
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g., A space explorer discovering a new planet"
              rows={3}
              className="w-full bg-transparent py-2 px-3 text-slate-200 focus:outline-none resize-y"
              required
            />
          </div>
        </div>
        
        {renderSelect('channelType', 'Channel / Video Type', channelTypeOptions)}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderSelect('videoStyle', 'Video Style', styleOptions)}
            {renderSelect('imageStyle', 'Image Style (AI Suggested)', styleOptions, isSuggesting)}
        </div>
        
        {renderSelect('writingStyle', 'Writing Style / Tone (AI Suggested)', styleOptions, isSuggesting)}

        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
            <div className="flex gap-4 items-center bg-slate-900 border border-slate-700 rounded-md p-2">
                <label className={`flex-1 text-center py-1.5 rounded-md cursor-pointer transition-colors ${formData.aspectRatio === '16:9' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700'}`}>
                    <input type="radio" name="aspectRatio" value="16:9" checked={formData.aspectRatio === '16:9'} onChange={handleRatioChange} className="sr-only" />
                    16:9 (Landscape)
                </label>
                 <label className={`flex-1 text-center py-1.5 rounded-md cursor-pointer transition-colors ${formData.aspectRatio === '9:16' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700'}`}>
                    <input type="radio" name="aspectRatio" value="9:16" checked={formData.aspectRatio === '9:16'} onChange={handleRatioChange} className="sr-only" />
                    9:16 (Portrait)
                </label>
            </div>
        </div>

        <div>
            <label htmlFor="durationInSeconds" className="block text-sm font-medium text-slate-300 mb-2">
                Desired Duration: <span className="font-bold text-indigo-400 tabular-nums">{displayDuration}</span>
            </label>
            <input
                type="range"
                id="durationInSeconds"
                name="durationInSeconds"
                min="60"
                max="1200"
                step="15"
                value={formData.durationInSeconds}
                onChange={handleChange}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
             <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1 min</span>
                <span>20 mins</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
                Note: The final script length is an AI estimate and may vary by +/- 1 minute to ensure a natural story pace.
            </p>
        </div>
        
        {renderSelect('language', 'Language', languageOptions)}

        <button
          type="submit"
          disabled={isSuggesting}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-indigo-800 disabled:cursor-not-allowed"
        >
          <MagicIcon />
          Generate Characters & Setting
        </button>
      </form>
    </div>
  );
};

export default InputForm;
