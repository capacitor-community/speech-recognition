import { WebPlugin } from "@capacitor/core";
import { SpeechRecognitionPlugin, UtteranceOptions } from "./definitions";

export class SpeechRecognitionWeb extends WebPlugin
  implements SpeechRecognitionPlugin {
  constructor() {
    super({
      name: "SpeechRecognition",
      platforms: ["web"],
    });
  }
  available(): Promise<{ available: boolean }> {
    throw new Error("Method not implemented.");
  }
  start(_options?: UtteranceOptions): Promise<{ matches: String[] }> {
    throw new Error("Method not implemented.");
  }
  stop(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getSupportedLanguages(): Promise<{ languages: any[] }> {
    throw new Error("Method not implemented.");
  }
  hasPermission(): Promise<{ permission: boolean }> {
    throw new Error("Method not implemented.");
  }
  requestPermission(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

const SpeechRecognition = new SpeechRecognitionWeb();

export { SpeechRecognition };

import { registerWebPlugin } from "@capacitor/core";
registerWebPlugin(SpeechRecognition);
