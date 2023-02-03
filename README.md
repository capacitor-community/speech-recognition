# Capacitor Speech Recognition Plugin

Capacitor community plugin for speech recognition.

## Maintainers

| Maintainer      | GitHub                                      | Social                                           | Sponsoring Company |
| --------------- | ------------------------------------------- | ------------------------------------------------ | ------------------ |
| Priyank Patel   | [priyankpat](https://github.com/priyankpat) | [@priyankpat\_](https://twitter.com/priyankpat_) | Ionic              |
| Matteo Padovano | [mrbatista](https://github.com/mrbatista)   | [@mrba7ista](https://twitter.com/mrba7ista)      |                    |

Maintenance Status: Actively Maintained

## Installation

To use npm

```bash
npm install @capacitor-community/speech-recognition
```

To use yarn

```bash
yarn add @capacitor-community/speech-recognition
```

Sync native files

```bash
npx cap sync
```

## iOS

iOS requires the following usage descriptions be added and filled out for your app in `Info.plist`:

- `NSSpeechRecognitionUsageDescription` (`Privacy - Speech Recognition Usage Description`)
- `NSMicrophoneUsageDescription` (`Privacy - Microphone Usage Description`)

## Android

No further action required.

## Configuration

No configuration required for this plugin

## Supported methods

| Name                  | Android | iOS | Web |
| :-------------------- | :------ | :-- | :-- |
| available             | ✅      | ✅  | ❌  |
| start                 | ✅      | ✅  | ❌  |
| stop                  | ✅      | ✅  | ❌  |
| getSupportedLanguages | ✅      | ✅  | ❌  |
| hasPermission         | ✅      | ✅  | ❌  |
| requestPermission     | ✅      | ✅  | ❌  |

## Usage

```typescript
import { SpeechRecognition } from "@capacitor-community/speech-recognition";

/**
 * This method will check if speech recognition feature is available on the device.
 * @param none
 * @returns available - boolean true/false for availability
 */
SpeechRecognition.available();

/**
 * This method will start to listen for utterance.
 * @param language - language key returned from getSupportedLanguages()
 *        maxResults - maximum number of results to return (5 is max)
 *        prompt - prompt message to display on popup (Android only)
 *        partialResults - return partial results if found
 *        popup - display popup window when listening for utterance (Android only)
 * If partialResults is true, the function respond directly without result and event `partialResults` will be emit for each partial result, until stopped.
 * @returns void
 */
SpeechRecognition.start({
  language: "en-US",
  maxResults: 2,
  prompt: "Say something",
  partialResults: true,
  popup: true,
});
// listin to partial results
SpeechRecognition.addListener("partialResults", (data: any) => {
  console.log("partialResults was fired", data.matches);
});
/**
 * This method will stop listening for utterance
 * @param none
 * @returns void
 */
SpeechRecognition.stop();

/**
 * This method will return list of languages supported by the speech recognizer.
 * @param none
 * @returns languages - array string of languages
 */
SpeechRecognition.getSupportedLanguages();

/**
 * This method will check for audio permissions.
 * @param none
 * @returns permission - boolean true/false if permissions are granted
 */
SpeechRecognition.hasPermission();

/**
 * This method will prompt the user for audio permission.
 * @param none
 * @returns void
 */
SpeechRecognition.requestPermission();
```
