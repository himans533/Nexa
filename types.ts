/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export enum AppState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

export enum AIModel {
  GEMINI_FLASH = 'gemini-3-flash-preview',
  GEMINI_PRO = 'gemini-3-pro-preview',
  GEMINI_2_5_FLASH = 'gemini-flash-latest',
}

export interface ImageFile {
  file?: File; // Optional because it's lost on localStorage save
  base64: string;
  mimeType: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  images?: ImageFile[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface GenerateParams {
  prompt: string;
  model: AIModel;
  image?: ImageFile | null;
  history?: Message[];
}