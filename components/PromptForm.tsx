
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  AIModel,
  GenerateParams,
  ImageFile,
} from '../types';
import {
  ArrowRightIcon,
  PlusIcon,
  XMarkIcon,
  MicIcon,
  StopIcon,
  MagicIcon,
} from './icons';
import { enhanceUserPrompt } from '../services/geminiService';

const fileToBase64 = <T extends {file?: File; base64: string; mimeType: string}>(
  file: File,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      if (base64) {
        resolve({file, base64, mimeType: file.type} as unknown as T);
      } else {
        reject(new Error('Failed to read file as base64.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
const fileToImageFile = (file: File): Promise<ImageFile> =>
  fileToBase64<ImageFile>(file);

const ImageUpload: React.FC<{
  onSelect: (image: ImageFile) => void;
  onRemove?: () => void;
  image?: ImageFile | null;
}> = ({onSelect, onRemove, image}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imageFile = await fileToImageFile(file);
        onSelect(imageFile);
      } catch (error) {
        console.error('Error converting file:', error);
      }
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  if (image) {
    return (
      <div className="relative group w-16 h-16 md:w-20 md:h-20 flex-shrink-0 ring-1 ring-indigo-500/50 rounded-lg">
        <img
          src={image.file ? URL.createObjectURL(image.file) : `data:${image.mimeType};base64,${image.base64}`}
          alt="preview"
          className="w-full h-full object-cover rounded-lg"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-colors"
          aria-label="Remove image">
          <XMarkIcon className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="p-3 rounded-xl hover:bg-gray-700/50 text-gray-400 hover:text-indigo-400 transition-colors flex items-center justify-center"
      title="Upload Image">
      <PlusIcon className="w-5 h-5" />
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </button>
  );
};

interface PromptFormProps {
  onGenerate: (params: GenerateParams) => void;
}

const PromptForm: React.FC<PromptFormProps> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<AIModel>(AIModel.GEMINI_FLASH);
  const [image, setImage] = useState<ImageFile | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onGenerate({
        prompt,
        model,
        image,
      });
      setPrompt('');
      setImage(null);
    },
    [prompt, model, image, onGenerate],
  );

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      
      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            }
        }
        if (finalTranscript) {
            setPrompt((prev) => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  };

  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    
    setIsEnhancing(true);
    try {
        const enhanced = await enhanceUserPrompt(prompt, model);
        setPrompt(enhanced);
    } catch (error) {
        console.error("Failed to enhance prompt", error);
    } finally {
        setIsEnhancing(false);
    }
  };

  const isSubmitDisabled = !prompt.trim() && !isListening;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="w-full relative">
        {image && (
             <div className="absolute bottom-full left-0 mb-3 ml-2">
                <ImageUpload onSelect={setImage} onRemove={() => setImage(null)} image={image} />
             </div>
        )}

        <div className={`flex items-end gap-2 bg-[#1a1d26] border rounded-2xl p-2 shadow-lg transition-all ${isListening ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-gray-700 focus-within:ring-1 focus-within:ring-indigo-500/50'}`}>
          
          <div className="relative flex-shrink-0 self-center md:self-end mb-1">
             {!image && <ImageUpload onSelect={setImage} onRemove={() => setImage(null)} image={image} />}
          </div>

          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={isListening ? "Listening..." : "Ask anything..."}
            className="flex-grow bg-transparent focus:outline-none resize-none text-sm md:text-base text-gray-200 placeholder-gray-500 max-h-32 md:max-h-48 py-3 px-2 min-w-0"
            rows={1}
            style={{ minHeight: '44px' }}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!isSubmitDisabled) handleSubmit(e);
                }
            }}
          />

          <div className="flex items-center gap-2 self-center md:self-end mb-1">
            
            {/* Enhance Button */}
            {prompt.trim().length > 3 && (
                <button
                    type="button"
                    onClick={handleEnhance}
                    disabled={isEnhancing}
                    className={`p-2 rounded-lg transition-colors ${isEnhancing ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-gray-700/50 text-indigo-400 hover:text-indigo-300'}`}
                    title="Enhance prompt with AI"
                >
                    {isEnhancing ? (
                        <div className="w-5 h-5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                    ) : (
                        <MagicIcon className="w-5 h-5" />
                    )}
                </button>
            )}

             {/* Mic Button */}
            <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-200'}`}
                title="Voice Input"
            >
                {isListening ? <StopIcon className="w-5 h-5" /> : <MicIcon className="w-5 h-5" />}
            </button>
            
             <div className="hidden md:block">
                <select 
                    value={model}
                    onChange={(e) => setModel(e.target.value as AIModel)}
                    className="bg-gray-800 text-xs text-gray-400 rounded-md py-1 px-2 border border-gray-700 outline-none focus:border-indigo-500"
                >
                    <option value={AIModel.GEMINI_FLASH}>Gemini 3 Flash</option>
                    <option value={AIModel.GEMINI_PRO}>Gemini 3 Pro</option>
                    <option value={AIModel.GEMINI_2_5_FLASH}>Gemini 2.5 Flash</option>
                </select>
             </div>

            <button
              type="submit"
              className={`p-3 rounded-xl transition-all duration-300 ${
                  isSubmitDisabled 
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]'
              }`}
              disabled={isSubmitDisabled}>
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2 px-2">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
               Powered by Google Gemini
            </p>
             <div className="md:hidden">
                <select 
                    value={model}
                    onChange={(e) => setModel(e.target.value as AIModel)}
                    className="bg-transparent text-[10px] text-gray-500 uppercase tracking-widest font-medium outline-none"
                >
                    <option value={AIModel.GEMINI_FLASH}>Gemini 3 Flash</option>
                    <option value={AIModel.GEMINI_PRO}>Gemini 3 Pro</option>
                    <option value={AIModel.GEMINI_2_5_FLASH}>Gemini 2.5 Flash</option>
                </select>
             </div>
        </div>
      </form>
    </div>
  );
};

export default PromptForm;