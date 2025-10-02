import React, { useState } from 'react';
import { PromotionalContent as PromotionalContentType } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { DownloadIcon } from './icons/DownloadIcon';

type Platform = 'youtube' | 'facebook' | 'tiktok';

interface CopyableFieldProps {
    label: string;
    value: string;
}

const CopyableField: React.FC<CopyableFieldProps> = ({ label, value }) => {
    const [copySuccess, setCopySuccess] = useState('');

    const handleCopy = () => {
        if (!value) return;
        navigator.clipboard.writeText(value).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            setCopySuccess('Error');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    return (
        <div className="relative">
            <label className="block text-sm font-semibold text-slate-400 mb-1">{label}</label>
            <div className="bg-slate-900/50 p-3 pr-12 rounded-md text-slate-300 text-sm whitespace-pre-wrap">{value}</div>
            <button
                title={`Copy ${label}`}
                onClick={handleCopy}
                className="absolute top-8 right-2 p-2 text-slate-400 hover:text-white rounded-md"
            >
                {copySuccess ? <span className="text-xs text-indigo-400">{copySuccess}</span> : <CopyIcon className="w-4 h-4" />}
            </button>
        </div>
    );
};


const PromotionalContent: React.FC<{ content: PromotionalContentType }> = ({ content }) => {
    const [activeTab, setActiveTab] = useState<Platform>('youtube');

    const handleDownload = () => {
      const { youtube, facebook, tiktok, thumbnail_prompt } = content;

      const createSafeFilename = (title: string): string => {
        if (!title) {
          return 'promotional_content';
        }
        // Sanitize the title to create a valid filename
        return title
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '_') // Replace invalid characters with an underscore
          .replace(/_+/g, '_')         // Collapse consecutive underscores
          .replace(/^_+|_+$/g, '')   // Trim leading/trailing underscores
          .slice(0, 60) || 'promotional_content'; // Limit length and provide a fallback
      };

      const filename = `${createSafeFilename(youtube.title)}.txt`;

      const textContent = `
=================================
=== ViraScript Promotional Content ===
=================================

--- YouTube ---
Title: ${youtube.title}
Description: ${youtube.description}
Hashtags: ${youtube.hashtags}

--- Facebook ---
Title: ${facebook.title}
Description: ${facebook.description}
Hashtags: ${facebook.hashtags}

--- TikTok ---
Caption: ${tiktok.caption}
Hashtags: ${tiktok.hashtags}

--- Thumbnail Prompt ---
${thumbnail_prompt}
      `.trim().replace(/^\s+/gm, '');

      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'youtube':
                return (
                    <div className="space-y-4">
                        <CopyableField label="YouTube Title" value={content.youtube.title} />
                        <CopyableField label="YouTube Description" value={content.youtube.description} />
                        <CopyableField label="Hashtags" value={content.youtube.hashtags} />
                    </div>
                );
            case 'facebook':
                 return (
                    <div className="space-y-4">
                        <CopyableField label="Facebook Title" value={content.facebook.title} />
                        <CopyableField label="Facebook Description" value={content.facebook.description} />
                        <CopyableField label="Hashtags" value={content.facebook.hashtags} />
                    </div>
                );
            case 'tiktok':
                 return (
                    <div className="space-y-4">
                        <CopyableField label="TikTok Caption" value={content.tiktok.caption} />
                        <CopyableField label="Hashtags" value={content.tiktok.hashtags} />
                    </div>
                );
            default:
                return null;
        }
    }

    const TabButton: React.FC<{platform: Platform, label: string}> = ({ platform, label }) => (
        <button
            onClick={() => setActiveTab(platform)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === platform ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
        >
            {label}
        </button>
    )

    return (
        <div className="bg-slate-800/50 p-6 rounded-2xl shadow-xl border border-slate-700">
            <div className="flex justify-center items-center gap-3 mb-1 text-center">
                 <h3 className="text-2xl font-bold text-white">Promotional Content</h3>
                 <button
                    onClick={handleDownload}
                    className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition-colors"
                    title="Download all content as a .txt file"
                    aria-label="Download all promotional content as a text file"
                >
                    <DownloadIcon className="w-5 h-5" />
                </button>
            </div>
            <p className="text-center text-slate-400 mb-6">AI-generated assets, tailored for each platform.</p>
            
            <div className="flex justify-center gap-2 mb-6 bg-slate-900/50 p-1.5 rounded-lg">
                <TabButton platform="youtube" label="YouTube" />
                <TabButton platform="facebook" label="Facebook" />
                <TabButton platform="tiktok" label="TikTok" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    {renderContent()}
                </div>
                <div className="md:col-span-2 mt-4">
                     <CopyableField label="Thumbnail Generation Prompt" value={content.thumbnail_prompt} />
                </div>
            </div>
        </div>
    );
};

export default PromotionalContent;