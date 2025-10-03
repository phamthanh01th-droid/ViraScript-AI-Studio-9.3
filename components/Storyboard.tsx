
import React, { useMemo, useState } from 'react';
import { StoryboardData, Scene, UserInput, CharacterProfile } from '../types';
import SceneCard from './SceneCard';
import PromotionalContent from './PromotionalContent';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

const formatDurationDisplay = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0 && remainingSeconds > 0) {
        return `${minutes}m ${remainingSeconds}s`;
    }
    if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return `${remainingSeconds} seconds`;
};


interface FullScriptOverviewProps {
    scenes: Scene[];
    masterScript: string;
    userInput: UserInput;
}

const FullScriptOverview: React.FC<FullScriptOverviewProps> = ({ scenes, masterScript, userInput }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [viewMode, setViewMode] = useState<'script' | 'story'>('script');

    if (!scenes || scenes.length === 0) {
        return null;
    }

    const TabButton: React.FC<{mode: 'script' | 'story', label: string}> = ({ mode, label }) => (
        <button
            onClick={() => setViewMode(mode)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${viewMode === mode ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
            aria-pressed={viewMode === mode}
        >
            {label}
        </button>
    );

    const DetailItem: React.FC<{label: string, value: string}> = ({label, value}) => (
        <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
            <p className="text-sm text-slate-200">{value}</p>
        </div>
    );

    return (
        <div className="mt-12 bg-slate-800/50 rounded-2xl border border-slate-700">
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="w-full flex justify-between items-center text-left p-6"
                aria-expanded={isVisible}
                aria-controls="full-script-panel"
            >
                <div>
                    <h3 className="text-2xl font-bold text-white">Full Script Overview</h3>
                    <p className="text-slate-400">Click to {isVisible ? 'hide' : 'show'} the complete script and project details.</p>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform ${isVisible ? 'rotate-180' : ''}`} />
            </button>
            {isVisible && (
                <div id="full-script-panel" className="px-6 pb-6">
                    <div className="border-t border-slate-700 pt-4 mt-2">
                        <div className="mb-6 p-4 bg-slate-900/50 rounded-lg">
                            <h4 className="text-lg font-bold text-white mb-3">Project Details</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <div className="col-span-2 md:col-span-3 lg:col-span-5">
                                    <DetailItem label="Topic" value={userInput.topic} />
                                </div>
                                <DetailItem label="Video Style" value={userInput.videoStyle} />
                                <DetailItem label="Image Style" value={userInput.imageStyle} />
                                <DetailItem label="Writing Style" value={userInput.writingStyle} />
                                <DetailItem label="Language" value={userInput.language} />
                                <DetailItem label="Duration" value={formatDurationDisplay(userInput.durationInSeconds)} />
                            </div>
                        </div>

                        <div className="flex justify-center gap-2 mb-4 bg-slate-900/50 p-1.5 rounded-lg max-w-xs mx-auto">
                           <TabButton mode="script" label="Script View" />
                           <TabButton mode="story" label="Story View" />
                        </div>

                        <div className="mt-4 max-h-96 overflow-y-auto pr-4 custom-scrollbar">
                           {viewMode === 'script' && (
                                <div className="space-y-4">
                                    {scenes.map(scene => {
                                        const prompt = scene.scene_prompt_json as any;
                                        const dialogue = prompt?.dialogue_line;
                                        const speaker = prompt?.speaker;
                                        const visual = prompt?.scene_description;
                                        return (
                                            <div key={scene.scene_number} className="border-b border-slate-700/50 pb-3 last:border-b-0">
                                                <p className="font-bold text-indigo-400">SCENE {scene.scene_number}</p>
                                                {visual && (
                                                    <p className="text-sm text-slate-300 mt-1">
                                                        <span className="font-semibold text-slate-400">VISUAL: </span>
                                                        {visual}
                                                    </p>
                                                )}
                                                {dialogue && (
                                                    <p className="text-sm text-slate-200 italic mt-1">
                                                        <span className="font-semibold text-slate-400 not-italic">
                                                            {speaker || 'NARRATOR'}:
                                                        </span>
                                                        &nbsp;&ldquo;{dialogue}&rdquo;
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                           )}
                           {viewMode === 'story' && (
                                <div className="text-slate-300 leading-relaxed">
                                   <p className="whitespace-pre-wrap">{masterScript}</p>
                                </div>
                           )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface StoryboardProps {
    storyboardData: StoryboardData;
    userInput: UserInput;
    characterProfile: CharacterProfile;
    onRestart: () => void;
    apiKeys: string[];
}

const Storyboard: React.FC<StoryboardProps> = ({ storyboardData, userInput, characterProfile, onRestart, apiKeys }) => {
  const [activeTab, setActiveTab] = useState<number>(1);

  const scenesByAct = useMemo(() => {
    return storyboardData.scenes.reduce((acc, scene) => {
      const act = scene.act || 1; // Default to act 1 if not present
      if (!acc[act]) {
        acc[act] = [];
      }
      acc[act].push(scene);
      return acc;
    }, {} as Record<number, Scene[]>);
  }, [storyboardData.scenes]);

  const availableActs = useMemo(() => Object.keys(scenesByAct).map(Number).sort((a,b) => a - b), [scenesByAct]);

  return (
    <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-2 text-white">AI Director's Storyboard</h2>
            <p className="text-slate-400 text-lg">Your vision, structured as a complete story.</p>
        </div>

        <PromotionalContent content={storyboardData.promotional_content} />

        <FullScriptOverview scenes={storyboardData.scenes} masterScript={storyboardData.master_script} userInput={userInput} />

        <div className="mt-12">
            <div className="mb-8 flex justify-center border-b border-slate-700">
                {availableActs.map(actNumber => (
                    <button
                        key={actNumber}
                        onClick={() => setActiveTab(actNumber)}
                        className={`-mb-px px-6 py-3 font-semibold text-base transition-colors duration-200 focus:outline-none ${
                            activeTab === actNumber
                                ? 'border-b-2 border-indigo-500 text-white'
                                : 'text-slate-400 hover:text-white border-b-2 border-transparent'
                        }`}
                    >
                        Act {actNumber}
                    </button>
                ))}
            </div>

            <div>
                {availableActs.map(actNumber => (
                    <div key={actNumber} className={activeTab === actNumber ? 'block' : 'hidden'}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {(scenesByAct[actNumber] || []).map(scene => (
                                <SceneCard key={scene.scene_number} scene={scene} imageStyle={userInput.imageStyle} aspectRatio={userInput.aspectRatio} characterProfile={characterProfile} apiKeys={apiKeys} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="text-center mt-16">
            <button
                onClick={onRestart}
                className="px-8 py-3 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition-colors"
            >
                Create a New Project
            </button>
        </div>
    </div>
  );
};

export default Storyboard;
