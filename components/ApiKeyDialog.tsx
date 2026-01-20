
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { KeyIcon } from './icons';

interface ApiKeyDialogProps {
  onContinue: (key: string) => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onContinue }) => {
  const [inputKey, setInputKey] = useState('');

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1d26] border border-[#22D3EE]/30 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.2)] max-w-lg w-full p-8 text-center flex flex-col items-center">
        <div className="bg-green-600/20 p-4 rounded-full mb-6">
          <KeyIcon className="w-12 h-12 text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">NEXA AI</h2>
        <h3 className="text-xl font-medium text-green-400 mb-6">OpenAI API Key Required</h3>
        <p className="text-gray-300 mb-6">
          To generate cinematic scripts and prompts, NEXA AI requires a valid OpenAI API Key. Your key is stored locally in your browser session.
        </p>
        
        <input 
            type="password" 
            placeholder="sk-..." 
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white mb-6 focus:ring-2 focus:ring-green-500 outline-none"
        />

        <p className="text-gray-400 mb-8 text-sm">
          Don't have a key?{' '}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:underline font-medium"
          >
            Get one here
          </a>.
        </p>
        <button
          onClick={() => {
              if (inputKey.trim().startsWith('sk-')) {
                  onContinue(inputKey.trim());
              } else {
                  alert("Please enter a valid OpenAI API key starting with 'sk-'");
              }
          }}
          disabled={!inputKey}
          className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-green-900/20 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Initialize Agent
        </button>
      </div>
    </div>
  );
};

export default ApiKeyDialog;