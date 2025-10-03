import React, { useState } from 'react';
// FIX: Import AspectRatio and CharacterProfile to be used in SceneCardProps.
import { Scene, AspectRatio, CharacterProfile } from '../types';
import Modal from './Modal';
import { CopyIcon } from './icons/CopyIcon';
import { ImageIcon } from './icons/ImageIcon';
import { VideoIcon } from './icons/VideoIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

interface SceneCardProps {
  scene: Scene;
  imageStyle: string;
  // FIX: Add missing properties to align with props passed from Storyboard component.
  aspectRatio: AspectRatio;
  characterProfile: CharacterProfile;
  apiKeys: string[];
}

// FIX: Destructure the new props. Although they are not used in this component yet, this fixes the type error.
const SceneCard: React.FC<SceneCardProps> = ({ scene, imageStyle, aspectRatio, characterProfile, apiKeys }) => {
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isImagePromptModalOpen, setIsImagePromptModalOpen] = useState(false);

  const [jsonCopySuccess, setJsonCopySuccess] = useState('');
  const [imagePromptCopySuccess, setImagePromptCopySuccess] = useState('');

  const promptData = scene.scene_prompt_json as any;

  // Display the main scene description directly. For Vietnamese projects, this will be in English as per the new logic.
  const sceneDescriptionForDisplay = promptData?.scene_description || '';

  // Construct the full, ready-to-use image prompt
  const masterDescription = promptData?.master_description || '';
  const sceneDescriptionForPrompt = promptData?.scene_description || '';
  const cameraShot = promptData?.camera_shot || '';
  const finalImagePrompt = `${masterDescription}. In this scene: ${sceneDescriptionForPrompt}. Camera Shot: ${cameraShot}. Style: ${imageStyle}.`;

  const handleCopy = (textToCopy: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
        setter('Copied!');
        setTimeout(() => setter(''), 2000);
    }, (err) => {
        setter('Failed');
        console.error('Could not copy text: ', err);
        setTimeout(() => setter(''), 2000);
    });
  };
  
  const handleCopyJson = (setter: React.Dispatch<React.SetStateAction<string>>) => {
      const jsonString = JSON.stringify(scene.scene_prompt_json, null, 2);
      handleCopy(jsonString, setter);
  }

  const handleCopyImagePrompt = (setter: React.Dispatch<React.SetStateAction<string>>) => {
      handleCopy(finalImagePrompt, setter);
  }


  const dialogue = promptData?.dialogue_line || '';
  const speaker = promptData?.speaker || '';
  const voiceName = promptData?.voice_name || 'Not specified';

  return (
    <>
      <div className="bg-slate-800 border border-slate-700 rounded-lg flex flex-col h-full overflow-hidden shadow-lg p-4">
        <h3 className="text-lg font-bold text-slate-200 mb-3">
            Scene {scene.scene_number}
        </h3>
        
        <div className="flex-grow space-y-3 text-sm">
            <div>
                <h4 className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Visuals</h4>
                <p className="text-slate-300">{sceneDescriptionForDisplay}</p>
            </div>
            
             <div className="flex items-center gap-2 text-teal-400">
                <VideoIcon className="w-4 h-4" />
                <p className="text-sm font-semibold">{cameraShot}</p>
            </div>

            {dialogue && (
                <div>
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-slate-400 text-xs uppercase tracking-wider">{speaker}</h4>
                        <div className="flex items-center gap-1.5 text-amber-400">
                            <MicrophoneIcon className="w-3 h-3" />
                            <p className="text-xs font-semibold break-all">{voiceName}</p>
                        </div>
                    </div>
                    <p className="text-slate-300 italic mt-1">"{dialogue}"</p>
                </div>
            )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex" role="group">
                <button
                    onClick={() => setIsImagePromptModalOpen(true)}
                    className="w-full flex-1 bg-slate-700 text-white font-bold py-2 px-3 rounded-l-md hover:bg-slate-600 transition-colors text-sm flex items-center justify-center gap-2"
                >
                    <ImageIcon className="w-4 h-4" />
                    Image Prompt
                </button>
                <button
                    onClick={() => handleCopyImagePrompt(setImagePromptCopySuccess)}
                    title="Copy Image Prompt"
                    aria-label="Copy Image Prompt"
                    className="flex items-center justify-center bg-slate-700 text-white p-2.5 rounded-r-md hover:bg-slate-600 transition-colors border-l border-slate-500"
                >
                   {imagePromptCopySuccess ? <span className="text-xs text-indigo-400 font-bold">Copied</span> : <CopyIcon className="w-4 h-4" />}
                </button>
            </div>
            <div className="flex" role="group">
                <button
                    onClick={() => setIsJsonModalOpen(true)}
                    className="w-full flex-1 bg-slate-700 text-white font-bold py-2 px-3 rounded-l-md hover:bg-slate-600 transition-colors text-sm"
                >
                    JSON Prompt
                </button>
                <button
                    onClick={() => handleCopyJson(setJsonCopySuccess)}
                    title="Copy JSON Prompt"
                    aria-label="Copy JSON Prompt"
                    className="flex items-center justify-center bg-slate-700 text-white p-2.5 rounded-r-md hover:bg-slate-600 transition-colors border-l border-slate-500"
                >
                   {jsonCopySuccess ? <span className="text-xs text-indigo-400 font-bold">Copied</span> : <CopyIcon className="w-4 h-4" />}
                </button>
            </div>
        </div>
      </div>

      <Modal isOpen={isJsonModalOpen} onClose={() => setIsJsonModalOpen(false)} title={`Scene ${scene.scene_number} JSON Prompt`}>
        <div className="relative">
            <button 
              onClick={() => handleCopyJson(setJsonCopySuccess)}
              className="absolute top-0 right-0 mt-2 mr-2 px-3 py-1 bg-slate-600 text-white text-xs font-bold rounded hover:bg-slate-500 flex items-center gap-2 z-10"
            >
                <CopyIcon className="w-4 h-4" />
                {jsonCopySuccess || 'Copy'}
            </button>
            <pre className="bg-slate-900 text-slate-300 text-xs p-4 rounded-lg overflow-x-auto max-h-[60vh]">
                <code>
                    {JSON.stringify(scene.scene_prompt_json, null, 2)}
                </code>
            </pre>
        </div>
      </Modal>

      <Modal isOpen={isImagePromptModalOpen} onClose={() => setIsImagePromptModalOpen(false)} title={`Scene ${scene.scene_number} Image Prompt`}>
        <div className="relative">
            <button 
              onClick={() => handleCopyImagePrompt(setImagePromptCopySuccess)}
              className="absolute top-0 right-0 mt-2 mr-2 px-3 py-1 bg-slate-600 text-white text-xs font-bold rounded hover:bg-slate-500 flex items-center gap-2 z-10"
            >
                <CopyIcon className="w-4 h-4" />
                {imagePromptCopySuccess || 'Copy'}
            </button>
            <div className="bg-slate-900 text-slate-300 text-sm p-4 rounded-lg overflow-x-auto max-h-[60vh]">
                <p className="whitespace-pre-wrap">{finalImagePrompt}</p>
            </div>
        </div>
      </Modal>
    </>
  );
};

export default SceneCard;
