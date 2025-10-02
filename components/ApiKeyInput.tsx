import React, { useState } from 'react';

interface ApiKeyInputProps {
  onSubmit: (apiKeys: string[]) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSubmit }) => {
  const [keys, setKeys] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedKeys = keys
      .split(/[\n,]+/)
      .map(k => k.trim())
      .filter(Boolean);

    if (parsedKeys.length > 0) {
      onSubmit(parsedKeys);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-slate-800/50 p-8 rounded-2xl shadow-2xl border border-slate-700">
      <h2 className="text-2xl font-bold text-center mb-2 text-white">Enter Your API Key(s)</h2>
      <p className="text-center text-slate-400 mb-6">
        Enter one or more Google AI Studio API keys, separated by commas or new lines.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="sr-only">
            API Keys
          </label>
          <textarea
            id="apiKey"
            name="apiKey"
            rows={4}
            value={keys}
            onChange={(e) => setKeys(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 px-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-y"
            placeholder="Enter key one,&#10;key two,&#10;key three..."
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-transform transform hover:scale-105"
        >
          Continue
        </button>
      </form>
       <p className="text-center text-xs text-slate-500 mt-4">
        Your keys are stored only in your browser's memory and are not sent to our servers.
      </p>
    </div>
  );
};

export default ApiKeyInput;