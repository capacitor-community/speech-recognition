import { WebPlugin } from "@capacitor/core";
import { SpeechRecognitionPlugin, UtteranceOptions } from "./definitions";

declare var window: any;

export class SpeechRecognitionWeb extends WebPlugin
  implements SpeechRecognitionPlugin {
  private speechRecognizer: any;
  constructor() {
    super({
      name: "SpeechRecognition",
      platforms: ["web"],
    });

    if (!this.speechRecognizer && window && window.webkitSpeechRecognition) {
      this.speechRecognizer = new window.webkitSpeechRecognition();
    }
  }

  available(): Promise<{ available: boolean }> {
    return new Promise((resolve, reject) => {
      if (!this.speechRecognizer) {
        reject("This feature is not supported.");
        return;
      }

      resolve({ available: this.speechRecognizer !== undefined });
    });
  }

  start(
    options: UtteranceOptions
  ): Promise<{ status: string; matches?: any; error?: string }> {
    var transcript = "";

    return new Promise((resolve, reject) => {
      const { language, maxResults, partialResults } = options;
      const maxResultCount = maxResults ? maxResults : 5;

      if (!this.speechRecognizer) {
        reject({
          status: "error",
          error: "This feature is not supported.",
        });
        return;
      }

      if (language) {
        this.speechRecognizer.lang = language;
      }

      this.speechRecognizer.onend = () => {
        if (!partialResults) {
          resolve({
            status: "success",
            matches: transcript,
          });
        }
      };
      this.speechRecognizer.onerror = reject;
      this.speechRecognizer.onresult = (ev: any) => {
        var temp_transcript = "";

        const results =
          ev.results.length > maxResultCount
            ? maxResultCount
            : ev.results.length;
        for (var i = ev.resultIndex; i < results; ++i) {
          if (ev.results[i].isFinal) {
            transcript += ev.results[i][0].transcript;
          } else {
            temp_transcript += ev.results[1][0].transcript;
          }
        }

        if (partialResults) {
          resolve({
            status: "success",
            matches: temp_transcript,
          });
        }
      };
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.speechRecognizer) {
        reject("This feature is not supported.");
        return;
      }

      this.speechRecognizer.stop();
      resolve();
    });
  }

  getSupportedLanguages(): Promise<{ languages: any[] }> {
    throw new Error("Method not implemented.");
  }

  hasPermission(): Promise<{ permission: boolean }> {
    return new Promise((resolve, reject) => {
      if (!this.speechRecognizer) {
        reject("This feature is not supported.");
        return;
      }

      navigator.getUserMedia(
        { audio: true },
        () => {
          resolve({ permission: true });
        },
        () => {
          reject({ permission: false });
        }
      );
    });
  }

  requestPermission(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

const SpeechRecognition = new SpeechRecognitionWeb();

export { SpeechRecognition };

import { registerWebPlugin } from "@capacitor/core";
registerWebPlugin(SpeechRecognition);
