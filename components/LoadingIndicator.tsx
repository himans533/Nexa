/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex flex-col items-start w-full max-w-full">
      <div className="flex items-end gap-2 mb-2">
         <img 
            src="/logo.png" 
            alt="AI" 
            className="w-15 h-15 rounded-full shadow-lg shadow-indigo-500/20 flex-shrink-0 object-cover"
         />
         <span className="text-sm font-semibold text-indigo-400 mb-1">NEXA AI</span>
      </div>
      
      <div className="relative p-4 md:p-6 bg-[#1f222e] rounded-2xl rounded-tl-none border border-gray-700 shadow-xl max-w-2xl w-full">
        <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
                <div className="w-6 h-6 border-2 border-[#22D3EE]/20 border-t-[#22D3EE] rounded-full animate-spin"></div>
            </div>
            <div className="min-w-0">
                <p className="text-sm text-gray-300 animate-pulse">
                    NEXA AI is thinking...
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;