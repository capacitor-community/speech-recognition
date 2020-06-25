import { WebPlugin } from '@capacitor/core';
import { SpeechRecognitionPlugin, UtteranceOptions } from './definitions';

export class SpeechRecognitionWeb extends WebPlugin implements SpeechRecognitionPlugin {
  constructor() {
    super({
      name: 'SpeechRecognition',
      platforms: ['web']
    });
  }
  available(): Promise<{ available: boolean; }> {
    throw new Error("Method not implemented.");
  }
  start(options: UtteranceOptions): Promise<void> {
    console.log(options);
    throw new Error("Method not implemented.");
  }
  stop(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getSupportedLanguages(): Promise<{ languages: any[]; }> {
    throw new Error("Method not implemented.");
  }
  hasPermission(): Promise<{ permission: boolean; }> {
    throw new Error("Method not implemented.");
  }
  requestPermission(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async echo(options: { value: string }): Promise<{value: string}> {
    console.log('ECHO', options);
    return options;
  }
}

const SpeechRecognition = new SpeechRecognitionWeb();

export { SpeechRecognition };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(SpeechRecognition);
