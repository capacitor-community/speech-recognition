import { WebPlugin } from '@capacitor/core';
import type { PermissionStatus, SpeechRecognitionPlugin, UtteranceOptions } from './definitions';
export declare class SpeechRecognitionWeb extends WebPlugin implements SpeechRecognitionPlugin {
    available(): Promise<{
        available: boolean;
    }>;
    start(_options?: UtteranceOptions): Promise<{
        matches?: string[];
    }>;
    stop(): Promise<void>;
    getSupportedLanguages(): Promise<{
        languages: any[];
    }>;
    hasPermission(): Promise<{
        permission: boolean;
    }>;
    isListening(): Promise<{
        listening: boolean;
    }>;
    requestPermission(): Promise<void>;
    checkPermissions(): Promise<PermissionStatus>;
    requestPermissions(): Promise<PermissionStatus>;
}
declare const SpeechRecognition: SpeechRecognitionWeb;
export { SpeechRecognition };
