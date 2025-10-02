import React, { useState } from 'react';
import { CharacterProfile } from '../types';
import { MagicIcon } from './icons/MagicIcon';
import { RefreshIcon } from './icons/RefreshIcon';

interface CharacterReviewProps {
  initialProfile: CharacterProfile;
  onSubmit: (data: CharacterProfile) => void;
  onBack: () => void;
  onRegenerate: () => void;
}

const availableVoices = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];

const CharacterReview: React.FC<CharacterReviewProps> = ({ initialProfile, onSubmit, onBack, onRegenerate }) => {
  const [editableProfile, setEditableProfile] = useState<CharacterProfile>(JSON.parse(JSON.stringify(initialProfile)));

  React.useEffect(() => {
    setEditableProfile(JSON.parse(JSON.stringify(initialProfile)));
  }, [initialProfile]);


  const handleCharacterChange = (index: number, field: 'name' | 'description' | 'voice', value: string) => {
    const updatedCharacters = [...editableProfile.characters];
    updatedCharacters[index] = { ...updatedCharacters[index], [field]: value };
    setEditableProfile({ ...editableProfile, characters: updatedCharacters });
  };
  
  const handleSettingChange = (field: 'name' | 'description', value: string) => {
    const updatedSetting = { ...editableProfile.setting, [field]: value };
    setEditableProfile({ ...editableProfile, setting: updatedSetting });
  };

  const handleNarratorVoiceChange = (value: string) => {
    setEditableProfile({ ...editableProfile, narratorVoice: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(editableProfile);
  };
  
  return (
    <div className="max-w-4xl mx-auto bg-slate-800/50 p-8 rounded-2xl shadow-2xl border border-slate-700">
      <h2 className="text-3xl font-bold text-center mb-2 text-white">Review & Refine</h2>
      <p className="text-center text-slate-400 mb-8">This is the core of visual and audio consistency. Edit the descriptions and assign voices to lock in the final look and feel.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-semibold border-b-2 border-indigo-500 pb-2 mb-4 text-slate-100">Characters</h3>
            <div className="space-y-6">
              {editableProfile.characters.map((char, index) => (
                <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-3">
                  <input
                    type="text"
                    value={char.name}
                    onChange={(e) => handleCharacterChange(index, 'name', e.target.value)}
                    className="w-full bg-transparent text-xl font-bold mb-2 text-indigo-400 focus:outline-none focus:ring-0"
                  />
                  <textarea
                    value={char.description}
                    onChange={(e) => handleCharacterChange(index, 'description', e.target.value)}
                    rows={4}
                    className="w-full bg-transparent text-slate-300 focus:outline-none focus:ring-0 resize-y"
                  />
                   <div>
                    <label htmlFor={`character-voice-${index}`} className="text-sm font-medium text-slate-400">Voice</label>
                    <select
                      id={`character-voice-${index}`}
                      value={char.voice}
                      onChange={(e) => handleCharacterChange(index, 'voice', e.target.value)}
                      className="w-full mt-1 bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {availableVoices.map(voice => (
                        <option key={voice} value={voice}>{voice}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold border-b-2 border-amber-500 pb-2 mb-4 text-slate-100">Narrator</h3>
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <label htmlFor="narrator-voice" className="text-sm font-medium text-slate-300">Narrator Voice</label>
                <select
                id="narrator-voice"
                value={editableProfile.narratorVoice}
                onChange={(e) => handleNarratorVoiceChange(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                {availableVoices.map(voice => (
                    <option key={voice} value={voice}>{voice}</option>
                ))}
                </select>
                <p className="text-xs text-slate-500 mt-2">Assigning a consistent voice ensures the narration sounds uniform throughout the video.</p>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold border-b-2 border-teal-500 pb-2 mb-4 text-slate-100">Setting</h3>
             <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <input
                    type="text"
                    value={editableProfile.setting.name}
                    onChange={(e) => handleSettingChange('name', e.target.value)}
                    className="w-full bg-transparent text-xl font-bold mb-2 text-teal-400 focus:outline-none focus:ring-0"
                />
                <textarea
                    value={editableProfile.setting.description}
                    onChange={(e) => handleSettingChange('description', e.target.value)}
                    rows={3}
                    className="w-full bg-transparent text-slate-300 focus:outline-none focus:ring-0 resize-y"
                />
             </div>
          </div>
        </div>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button
                type="button"
                onClick={onBack}
                className="w-full sm:w-auto px-6 py-3 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition-colors"
            >
                Back to Idea
            </button>
             <button
                type="button"
                onClick={onRegenerate}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-500 transition-colors"
            >
                <RefreshIcon />
                Regenerate
            </button>
            <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-transform transform hover:scale-105"
            >
                <MagicIcon />
                Create Storyboard
            </button>
        </div>
      </form>
    </div>
  );
};

export default CharacterReview;