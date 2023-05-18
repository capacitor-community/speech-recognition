import type { PluginListenerHandle } from "@capacitor/core";
export interface SpeechRecognitionPlugin {
  available(): Promise<{ available: boolean }>;
  start(options?: UtteranceOptions): Promise<{ matches: string[] }>;
  stop(): Promise<void>;
  getSupportedLanguages(): Promise<{ languages: any[] }>;
  hasPermission(): Promise<{ permission: boolean }>;
  requestPermission(): Promise<void>;
  /**
   * Called when partialResults set to true and result received.
   *
   * On Android it doesn't work if popup is true.
   *
   * Provides partial result.
   *
   * @since 2.0.2
   */
  addListener(
    eventName: "partialResults",
    listenerFunc: (data: { matches: string[] }) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
  /**
   * Remove all the listeners that are attached to this plugin.
   *
   * @since 4.0.0
   */
  removeAllListeners(): Promise<void>;
}

export interface UtteranceOptions {
  language?: string;
  maxResults?: number;
  prompt?: string;
  popup?: boolean;
  partialResults?: boolean;
}
