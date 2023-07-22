import type { PermissionState, PluginListenerHandle } from "@capacitor/core";

export interface PermissionStatus {
  /**
   * Permission state for speechRecognition alias.
   *
   * On Android it requests/checks RECORD_AUDIO permission
   *
   * On iOS it requests/checks the speech recognition and microphone permissions.
   *
   * @since 5.0.0
   */
  speechRecognition: PermissionState;
}

export interface SpeechRecognitionPlugin {
  available(): Promise<{ available: boolean }>;
  start(options?: UtteranceOptions): Promise<{ matches: string[] }>;
  stop(): Promise<void>;
  getSupportedLanguages(): Promise<{ languages: any[] }>;
  /**
   * @deprecated use `checkPermissions()`
   */
  hasPermission(): Promise<{ permission: boolean }>;
  /**
   * @deprecated use `requestPermissions()`
   */
  requestPermission(): Promise<void>;
  /**
   * Check the speech recognition permission.
   *
   * @since 5.0.0
   */
  checkPermissions(): Promise<PermissionStatus>;
  /**
   * Request the speech recognition permission.
   *
   * @since 5.0.0
   */
  requestPermissions(): Promise<PermissionStatus>;
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
  addPunctuation?: boolean;
}
