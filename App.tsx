import React, { useState, useCallback } from 'react';
import { AppStage, UserInput, CharacterProfile, StoryboardData, Scene } from './types';
import { generateCharacterProfile, generateMasterScript, breakdownScriptIntoScenes } from './services/geminiService';

import Header from './components/Header';
import ApiKeyInput from './components/ApiKeyInput';
import InputForm from './components/InputForm';
import CharacterReview from './components/CharacterReview';
import Storyboard from './components/Storyboard';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [appStage, setAppStage] = useState<AppStage>(AppStage.INPUT);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [characterProfile, setCharacterProfile] = useState<CharacterProfile | null>(null);
  const [storyboardData, setStoryboardData] = useState<StoryboardData | null>(null);
  
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setAppStage(AppStage.ERROR);
    setIsLoading(false);
  };

  const handleApiKeySubmit = (keys: string[]) => {
    setApiKeys(keys);
  };

  const handleInputFormSubmit = useCallback(async (data: UserInput) => {
    setUserInput(data);
    setIsLoading(true);
    setLoadingMessage('Generating Characters & Setting...');
    setError(null);

    try {
      const profile = await generateCharacterProfile(data, apiKeys);
      setCharacterProfile(profile);
      setAppStage(AppStage.CHARACTER_REVIEW);
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'Failed to generate character profile.');
    } finally {
      setIsLoading(false);
    }
  }, [apiKeys]);

  const handleRegenerateCharacters = useCallback(async () => {
    if (!userInput) return;
    setIsLoading(true);
    setLoadingMessage('Regenerating Characters & Setting...');
    setError(null);
    try {
      const profile = await generateCharacterProfile(userInput, apiKeys);
      setCharacterProfile(profile);
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'Failed to regenerate character profile.');
    } finally {
      setIsLoading(false);
    }
  }, [userInput, apiKeys]);
  
  const handleCharacterReviewSubmit = useCallback(async (data: CharacterProfile) => {
    if (!userInput) return;
    setCharacterProfile(data);
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Generate the master script that adheres to the duration
      setLoadingMessage('Writing the master script...');
      const masterScript = await generateMasterScript(userInput, data, apiKeys);

      // Step 2: Break down the master script into individual scenes
      setLoadingMessage('Breaking script into scenes...');
      const storyboard = await breakdownScriptIntoScenes(userInput, data, masterScript, apiKeys);
      
      // Post-process to inject the correct scene number and total scenes into the JSON prompt
      const totalScenes = storyboard.scenes.length;
      const updatedScenes = storyboard.scenes.map((scene: Scene, index: number) => {
        const prompt = scene.scene_prompt_json as any;
        if (prompt.scene_context) {
            prompt.scene_context.scene_number = index + 1;
            prompt.scene_context.total_scenes = totalScenes;
        }
        return { ...scene, scene_prompt_json: prompt, scene_number: index + 1 };
      });
      
      storyboard.scenes = updatedScenes;
      storyboard.master_script = masterScript; // Attach master script to the final data
      
      setStoryboardData(storyboard);
      setAppStage(AppStage.STORYBOARD);
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'Failed to generate storyboard.');
    } finally {
      setIsLoading(false);
    }
  }, [userInput, apiKeys]);

  const handleBackToInput = () => {
    setAppStage(AppStage.INPUT);
    setCharacterProfile(null);
    setStoryboardData(null);
  };

  const handleRestart = () => {
    setAppStage(AppStage.INPUT);
    setUserInput(null);
    setCharacterProfile(null);
    setStoryboardData(null);
    setError(null);
  };

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center">
                <Spinner />
                <p className="mt-4 text-xl text-white font-semibold tracking-wide">{loadingMessage}</p>
                <p className="mt-2 text-slate-400">The AI is hard at work. This may take a moment...</p>
            </div>
        );
    }
    
    if (appStage === AppStage.ERROR) {
        return (
            <div className="max-w-2xl mx-auto text-center bg-red-900/50 p-8 rounded-lg border border-red-700">
                <h2 className="text-2xl font-bold text-red-300 mb-4">An Error Occurred</h2>
                <p className="text-red-200 mb-6">{error}</p>
                <button
                    onClick={handleRestart}
                    className="px-6 py-2 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition-colors"
                >
                    Start Over
                </button>
            </div>
        );
    }

    if (apiKeys.length === 0) {
        return <ApiKeyInput onSubmit={handleApiKeySubmit} />;
    }

    switch (appStage) {
      case AppStage.INPUT:
        return <InputForm onSubmit={handleInputFormSubmit} apiKeys={apiKeys} />;
      case AppStage.CHARACTER_REVIEW:
        if (characterProfile) {
          return (
            <CharacterReview 
              initialProfile={characterProfile} 
              onSubmit={handleCharacterReviewSubmit}
              onBack={handleBackToInput}
              onRegenerate={handleRegenerateCharacters} 
            />
          );
        }
        return null;
      case AppStage.STORYBOARD:
        if (storyboardData && userInput && characterProfile) {
          return (
            <Storyboard 
              storyboardData={storyboardData} 
              userInput={userInput}
              characterProfile={characterProfile}
              onRestart={handleRestart}
              apiKeys={apiKeys}
            />
          );
        }
        return null;
      default:
        return <InputForm onSubmit={handleInputFormSubmit} apiKeys={apiKeys} />;
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-slate-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;