declare module "@capacitor/core" {
  interface PluginRegistry {
    SpeechRecognition: SpeechRecognitionPlugin;
  }
}

export interface SpeechRecognitionPlugin {
  available(): Promise<{ available: boolean }>;
  start(
    options: UtteranceOptions
  ): Promise<{ status: string; matches?: any; error?: string }>;
  stop(): Promise<void>;
  getSupportedLanguages(): Promise<{ languages: any[] }>;
  hasPermission(): Promise<{ permission: boolean }>;
  requestPermission(): Promise<void>;
}

export interface UtteranceOptions {
  language: string;
  maxResults: number;
  prompt: string;
  popup: boolean;
  partialResults: boolean;
}
