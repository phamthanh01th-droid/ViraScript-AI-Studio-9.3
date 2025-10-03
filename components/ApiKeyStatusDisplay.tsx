import React from 'react';

interface ApiKeyStatusDisplayProps {
  apiKeys: string[];
  statuses: Map<string, 'active' | 'failed'>;
  nextKeyIndex: number;
  onManageKeys: () => void;
}

const ApiKeyStatusDisplay: React.FC<ApiKeyStatusDisplayProps> = ({ apiKeys, statuses, nextKeyIndex, onManageKeys }) => {
  const maskKey = (key: string) => {
    if (key.length < 8) return '***';
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  };

  const hasActiveKeys = apiKeys.some(k => statuses.get(k) === 'active');

  return (
    <div className="text-xs text-slate-400 mt-2">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold">API Keys:</span>
          {apiKeys.map((key, index) => {
            const status = statuses.get(key) || 'active';
            const isNext = hasActiveKeys && index === nextKeyIndex && status === 'active';
            return (
              <span key={index} title={key} className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${isNext ? 'bg-blue-900/70 ring-1 ring-blue-500' : 'bg-slate-800'}`}>
                <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="font-mono">{maskKey(key)}</span>
                {isNext && <span className="text-blue-400 font-bold text-[10px]">NEXT</span>}
              </span>
            );
          })}
        </div>
        <button onClick={onManageKeys} className="ml-auto text-indigo-400 hover:text-indigo-300 font-semibold underline text-sm whitespace-nowrap">
          Manage Keys
        </button>
      </div>
    </div>
  );
};

export default ApiKeyStatusDisplay;