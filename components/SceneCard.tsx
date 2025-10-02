import React, { useState } from 'react';
import { Scene, AspectRatio, CharacterProfile } from '../types';
import Modal from './Modal';
import Spinner from './Spinner';
import { CopyIcon } from './icons/CopyIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { MagicIcon } from './icons/MagicIcon';
import { generateImage } from '../services/geminiService';
import { VideoIcon } from './icons/VideoIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

interface SceneCardProps {
  scene: Scene;
  imageStyle: string;
  aspectRatio: AspectRatio;
  characterProfile: CharacterProfile;
  apiKeys: string[];
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, imageStyle, aspectRatio, characterProfile, apiKeys }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCopySuccess, setModalCopySuccess] = useState('');
  const [cardCopySuccess, setCardCopySuccess] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const promptData = scene.scene_prompt_json as any;

  const handleCopyJson = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    const jsonString = JSON.stringify(scene.scene_prompt_json, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
        setter('Copied!');
        setTimeout(() => setter(''), 2000);
    }, (err) => {
        setter('Failed');
        console.error('Could not copy text: ', err);
        setTimeout(() => setter(''), 2000);
    });
  };

  const handleGenerateImage = async () => {
      setIsGenerating(true);
      setError(null);
      
      const masterDescription = promptData?.master_description || '';
      const sceneDescription = promptData?.scene_description || '';
      const cameraShot = promptData?.camera_shot || '';
      
      // The new prompt structure already provides the master description, ensuring consistency.
      const finalImagePrompt = `${masterDescription}. In this scene: ${sceneDescription}. Camera Shot: ${cameraShot}. Style: ${imageStyle}.`;

      try {
          const base64Bytes = await generateImage(finalImagePrompt, aspectRatio, apiKeys);
          setImageUrl(`data:image/jpeg;base64,${base64Bytes}`);
      } catch (err)          {
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
          setIsGenerating(false);
      }
  };

  const imagePrompt = promptData?.scene_description || 'No visual description provided.';
  const dialogue = promptData?.dialogue_line || '';
  const character = promptData?.dialogue_character || '';
  const cameraShot = promptData?.camera_shot || 'Not specified';
  const voiceModel = promptData?.voice_model || 'Not specified';

  return (
    <>
      <div className="bg-slate-800 border border-slate-700 rounded-lg flex flex-col h-full overflow-hidden shadow-lg">
        <div className={`relative ${aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'} bg-slate-900/50 flex items-center justify-center`}>
            {isGenerating && <Spinner />}
            {error && !isGenerating && <p className="text-center text-red-400 text-sm p-4">{error}</p>}
            {imageUrl && !isGenerating && (
                <>
                    <img src={imageUrl} alt={`Generated preview for Scene ${scene.scene_number}`} className="w-full h-full object-cover" />
                    <a
                        href={imageUrl}
                        download={`scene_${scene.scene_number}.jpg`}
                        className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors"
                        title="Download Image"
                        aria-label="Download Image"
                    >
                        <DownloadIcon className="w-5 h-5" />
                    </a>
                </>
            )}
            {!isGenerating && !imageUrl && !error && (
                <div className="text-center text-slate-500">
                    <MagicIcon className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-sm font-semibold">Image Preview</p>
                </div>
            )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-lg font-bold text-slate-200 mb-3">
                Scene {scene.scene_number}
            </h3>
            
            <div className="flex-grow space-y-3 text-sm">
                <div>
                    <h4 className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Visuals</h4>
                    <p className="text-slate-300">{imagePrompt}</p>
                </div>
                
                 <div className="flex items-center gap-2 text-teal-400">
                    <VideoIcon className="w-4 h-4" />
                    <p className="text-sm font-semibold">{cameraShot}</p>
                </div>

                {dialogue && (
                    <div>
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-slate-400 text-xs uppercase tracking-wider">{character}</h4>
                            <div className="flex items-center gap-1.5 text-amber-400">
                                <MicrophoneIcon className="w-3 h-3" />
                                <p className="text-xs font-semibold">{voiceModel}</p>
                            </div>
                        </div>
                        <p className="text-slate-300 italic mt-1">"{dialogue}"</p>
                    </div>
                )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                    onClick={handleGenerateImage}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-2 px-3 rounded-md hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors text-sm"
                >
                    <MagicIcon className="w-4 h-4" />
                    {imageUrl ? 'Regenerate' : 'Generate'}
                </button>
                <div className="flex" role="group">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full flex-1 bg-slate-700 text-white font-bold py-2 px-3 rounded-l-md hover:bg-slate-600 transition-colors text-sm"
                    >
                        JSON Prompt
                    </button>
                    <button
                        onClick={() => handleCopyJson(setCardCopySuccess)}
                        title="Copy JSON Prompt"
                        aria-label="Copy JSON Prompt"
                        className="flex items-center justify-center bg-slate-700 text-white p-2.5 rounded-r-md hover:bg-slate-600 transition-colors border-l border-slate-500"
                    >
                       {cardCopySuccess ? <span className="text-xs text-indigo-400 font-bold">Copied</span> : <CopyIcon className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Scene ${scene.scene_number} JSON Prompt`}>
        <div className="relative">
            <button 
              onClick={() => handleCopyJson(setModalCopySuccess)}
              className="absolute top-0 right-0 mt-2 mr-2 px-3 py-1 bg-slate-600 text-white text-xs font-bold rounded hover:bg-slate-500 flex items-center gap-2 z-10"
            >
                <CopyIcon className="w-4 h-4" />
                {modalCopySuccess || 'Copy'}
            </button>
            <pre className="bg-slate-900 text-slate-300 text-xs p-4 rounded-lg overflow-x-auto max-h-[60vh]">
                <code>
                    {JSON.stringify(scene.scene_prompt_json, null, 2)}
                </code>
            </pre>
        </div>
      </Modal>
    </>
  );
};

export default SceneCard;