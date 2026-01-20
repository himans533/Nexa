
import React, { useState } from 'react';
import { ArrowPathIcon, CopyIcon, ClipboardIcon} from './icons';


interface ResultProps {
  content: string;
  onRetry: () => void;
}

const VideoResult: React.FC<ResultProps> = ({
  content,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="flex flex-col items-start w-full max-w-full">
       {/* AI Avatar Label */}
       <div className="flex items-end gap-2 mb-2">
         <img 
            src="/logo.png" 
            alt="AI" 
            className="w-10 h-10 rounded-full shadow-lg shadow-indigo-500/20 flex-shrink-0 object-cover"
         />
         <span className="text-sm font-semibold text-indigo-400 mb-1">NEXA AI</span>
      </div>

      <div className="w-full relative flex flex-col gap-0 bg-[#1f222e] rounded-2xl rounded-tl-none border border-gray-700/80 shadow-2xl overflow-hidden max-w-3xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* Text Content */}
        <div className="p-4 md:p-6 overflow-x-auto max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <pre className="whitespace-pre-wrap font-sans text-sm md:text-base text-gray-200 leading-relaxed selection:bg-indigo-500/30">
                {content}
            </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap justify-end gap-3 p-3 md:p-4 border-t border-gray-700/50 bg-[#15171e]">
            <button
                onClick={onRetry}
                className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs md:text-sm font-medium rounded-lg transition-all"
            >
                <ArrowPathIcon className="w-3 h-3 md:w-4 md:h-4" />
                Regenerate
            </button>
            
            <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-white text-xs md:text-sm font-medium rounded-lg transition-all shadow-lg ${
                    copied 
                    ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20' 
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20'
                }`}
            >
                {copied ? <ClipboardIcon className="w-3 h-3 md:w-4 md:h-4" /> : <CopyIcon className="w-3 h-3 md:w-4 md:h-4" />}
                {copied ? 'Copied' : 'Copy'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default VideoResult;