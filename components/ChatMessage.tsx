/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { Message } from '../types';
import { UserIcon, CopyIcon, ClipboardIcon } from './icons';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
      
        {isUser ? (
             <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shadow-lg mt-auto mb-1 bg-indigo-600">
                <UserIcon className="w-5 h-5 text-white" />
            </div>
        ) : (
            <img 
                src="/logo.png" 
                alt="AI" 
                className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl shadow-lg mt-auto mb-1 object-cover bg-black/20"
            />
        )}

        {/* Content Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            
            {/* Name Label (Optional, good for context) */}
            <div className={`mb-1 opacity-60 text-[10px] px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                <span className="font-semibold text-gray-400">{isUser ? 'You' : 'Nexa AI'}</span>
            </div>

            {/* Bubble */}
            <div className={`
                relative p-3 md:p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-md
                ${isUser 
                    ? 'bg-[#2c2c2e] text-gray-100 rounded-br-sm border border-gray-700' 
                    : 'bg-[#1a1d26] text-gray-200 rounded-bl-sm border border-gray-800'
                }
            `}>
                {/* Image Attachments */}
                {message.images && message.images.length > 0 && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                        {message.images.map((img, idx) => (
                            <img 
                                key={idx} 
                                src={img.file ? URL.createObjectURL(img.file) : `data:${img.mimeType || 'image/png'};base64,${img.base64}`}
                                alt="attachment" 
                                className="h-32 w-auto rounded-lg border border-gray-600 object-cover"
                            />
                        ))}
                    </div>
                )}

                {/* Text Content */}
                <div className="whitespace-pre-wrap font-sans mb-1 break-words">
                    {message.content}
                </div>

                {/* Footer: Timestamp & Actions */}
                <div className="flex items-center justify-end gap-2 mt-1 select-none">
                     {!isUser && (
                        <button 
                            onClick={handleCopy}
                            className="opacity-50 hover:opacity-100 transition-opacity"
                            title="Copy message"
                        >
                            {copied ? <ClipboardIcon className="w-3 h-3 text-green-400" /> : <CopyIcon className="w-3 h-3 text-gray-400" />}
                        </button>
                    )}
                    <span className={`text-[10px] ${isUser ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                    </span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;