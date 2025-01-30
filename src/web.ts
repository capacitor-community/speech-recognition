import { WebPlugin } from '@capacitor/core';

import type {
  PermissionStatus,
  SpeechRecognitionPlugin,
  UtteranceOptions,
} from './definitions';

export class SpeechRecognitionWeb
  extends WebPlugin
  implements SpeechRecognitionPlugin
{
  available(): Promise<{ available: boolean }> {
    throw this.unimplemented('Method not implemented on web.');
  }
  start(_options?: UtteranceOptions): Promise<{ matches?: string[] }> {
    throw this.unimplemented('Method not implemented on web.');
  }
  stop(): Promise<void> {
    throw this.unimplemented('Method not implemented on web.');
  }
  getSupportedLanguages(): Promise<{ languages: any[] }> {
    throw this.unimplemented('Method not implemented on web.');
  }
  hasPermission(): Promise<{ permission: boolean }> {
    throw this.unimplemented('Method not implemented on web.');
  }
  isListening(): Promise<{ listening: boolean }> {
    throw this.unimplemented('Method not implemented on web.');
  }
  requestPermission(): Promise<void> {
    throw this.unimplemented('Method not implemented on web.');
  }
  checkPermissions(): Promise<PermissionStatus> {
    throw this.unimplemented('Method not implemented on web.');
  }
  requestPermissions(): Promise<PermissionStatus> {
    throw this.unimplemented('Method not implemented on web.');
  }
}

const SpeechRecognition = new SpeechRecognitionWeb();

export { SpeechRecognition };
