export interface SpeechRecognitionPlugin {
  available(): Promise<{ available: boolean }>;
  start(options?: UtteranceOptions): Promise<{ matches: String[] }>;
  stop(): Promise<void>;
  getSupportedLanguages(): Promise<{ languages: any[] }>;
  hasPermission(): Promise<{ permission: boolean }>;
  requestPermission(): Promise<void>;
}

export interface UtteranceOptions {
  language?: string;
  maxResults?: number;
  prompt?: string;
  popup?: boolean;
  partialResults?: boolean;
}
