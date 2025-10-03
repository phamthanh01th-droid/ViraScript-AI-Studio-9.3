import React from 'react';
import ApiKeyStatusDisplay from './ApiKeyStatusDisplay';

interface HeaderProps {
    apiKeys: string[];
    onManageKeys: () => void;
    statuses: Map<string, 'active' | 'failed'>;
    nextKeyIndex: number;
}

const Header: React.FC<HeaderProps> = ({ apiKeys, onManageKeys, statuses, nextKeyIndex }) => {
  return (
    <header className="bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-800">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider">
          <span className="text-indigo-400">ViraScript</span> AI Studio 9.5
        </h1>
        <p className="text-sm text-slate-400">The AI Director's Workbench</p>
        {apiKeys.length > 0 && (
            <ApiKeyStatusDisplay 
                apiKeys={apiKeys}
                statuses={statuses}
                nextKeyIndex={nextKeyIndex}
                onManageKeys={onManageKeys}
            />
        )}
      </div>
    </header>
  );
};

export default Header;