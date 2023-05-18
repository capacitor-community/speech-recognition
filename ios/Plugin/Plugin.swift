import Foundation
import Capacitor
import Speech


@objc(SpeechRecognition)
public class SpeechRecognition: CAPPlugin {

    let DEFAULT_LANGUAGE = "en-US"
    let DEFAULT_MATCHES = 5
    let MESSAGE_MISSING_PERMISSION = "Missing permission"
    let MESSAGE_ACCESS_DENIED = "User denied access to speech recognition"
    let MESSAGE_RESTRICTED = "Speech recognition restricted on this device"
    let MESSAGE_NOT_DETERMINED = "Speech recognition not determined on this device"
    let MESSAGE_ACCESS_DENIED_MICROPHONE = "User denied access to microphone"
    let MESSAGE_ONGOING = "Ongoing speech recognition"
    let MESSAGE_UNKNOWN = "Unknown error occured"

    private var speechRecognizer : SFSpeechRecognizer?
    private var audioEngine : AVAudioEngine?
    private var recognitionRequest : SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask : SFSpeechRecognitionTask?

    @objc func available(_ call: CAPPluginCall) {
        guard let recognizer = SFSpeechRecognizer() else {
            call.resolve([
                "available": false
            ])
            return
        }
        call.resolve([
            "available": recognizer.isAvailable
        ])
    }

    @objc func start(_ call: CAPPluginCall) {
        if (self.audioEngine != nil) {
            if (self.audioEngine!.isRunning) {
                call.reject(self.MESSAGE_ONGOING)
                return
            }
        }

        let status: SFSpeechRecognizerAuthorizationStatus = SFSpeechRecognizer.authorizationStatus()
        if status != SFSpeechRecognizerAuthorizationStatus.authorized {
            call.reject(self.MESSAGE_MISSING_PERMISSION)
            return
        }

        AVAudioSession.sharedInstance().requestRecordPermission { (granted) in
            if !granted {
                call.reject(self.MESSAGE_ACCESS_DENIED_MICROPHONE)
                return
            }

            let language: String = call.getString("language") ?? "en-US"
            let maxResults : Int = call.getInt("maxResults") ?? self.DEFAULT_MATCHES
            let partialResults : Bool = call.getBool("partialResults") ?? false

            if (self.recognitionTask != nil) {
                self.recognitionTask?.cancel()
                self.recognitionTask = nil
            }

            self.audioEngine = AVAudioEngine.init();
            self.speechRecognizer = SFSpeechRecognizer.init(locale: Locale(identifier: language));

            let audioSession: AVAudioSession = AVAudioSession.sharedInstance()
            do {
                try audioSession.setCategory(AVAudioSession.Category.playAndRecord, options: AVAudioSession.CategoryOptions.defaultToSpeaker)
                try audioSession.setMode(AVAudioSession.Mode.default)
                try audioSession.setActive(true, options: AVAudioSession.SetActiveOptions.notifyOthersOnDeactivation)
            } catch {

            }

            self.recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
            self.recognitionRequest?.shouldReportPartialResults = partialResults

            let inputNode: AVAudioInputNode = self.audioEngine!.inputNode
            let format: AVAudioFormat = inputNode.outputFormat(forBus: 0)

            self.recognitionTask = self.speechRecognizer?.recognitionTask(with: self.recognitionRequest!, resultHandler: { (result, error) in
                if (result != nil) {
                    let resultArray: NSMutableArray = NSMutableArray()
                    var counter: Int = 0

                    for transcription: SFTranscription in result!.transcriptions {
                        if maxResults > 0 && counter < maxResults {
                            resultArray.add(transcription.formattedString)
                        }
                        counter+=1
                    }

                    if (partialResults) {
                        self.notifyListeners("partialResults", data: ["matches": resultArray])
                    } else {
                        call.resolve([
                            "matches": resultArray
                        ])
                    }


                    if result!.isFinal {
                        self.audioEngine!.stop()
                        self.audioEngine?.inputNode.removeTap(onBus: 0)
                        self.recognitionTask = nil
                        self.recognitionRequest = nil
                    }
                }

                if (error != nil) {
                    self.audioEngine!.stop()
                    self.audioEngine?.inputNode.removeTap(onBus: 0)
                    self.recognitionRequest = nil
                    self.recognitionTask = nil

                    call.reject(error!.localizedDescription)
                }
            })

            inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { (buffer: AVAudioPCMBuffer, when: AVAudioTime) in
                self.recognitionRequest?.append(buffer)
            }

            self.audioEngine?.prepare()
            do {
                try self.audioEngine?.start()
                if (partialResults) {
                    call.resolve()
                }
            } catch {
                call.reject(self.MESSAGE_UNKNOWN)
            }
        }
    }

    @objc func stop(_ call: CAPPluginCall) {
        DispatchQueue.global(qos: DispatchQoS.QoSClass.default).async {
            if let engine = self.audioEngine, engine.isRunning {
                engine.stop()
                self.recognitionRequest?.endAudio()
            }
            call.resolve()
        }
    }

    @objc func getSupportedLanguages(_ call: CAPPluginCall) {
        let supportedLanguages : Set<Locale>! = SFSpeechRecognizer.supportedLocales() as Set<Locale>
        let languagesArr : NSMutableArray = NSMutableArray()

        for lang: Locale in supportedLanguages {
            languagesArr.add(lang.identifier)
        }

        call.resolve([
            "languages": languagesArr
        ])
    }

    @objc func hasPermission(_ call: CAPPluginCall) {
        let status: SFSpeechRecognizerAuthorizationStatus = SFSpeechRecognizer.authorizationStatus()
        let speechAuthGranted : Bool = (status == SFSpeechRecognizerAuthorizationStatus.authorized)

        if (!speechAuthGranted) {
            call.resolve([
                "permission": false
            ])
            return
        }

        AVAudioSession.sharedInstance().requestRecordPermission { (granted: Bool) in
            call.resolve([
                "permission": granted
            ])
        }
    }

    @objc override public func checkPermissions(_ call: CAPPluginCall) {
        let status: SFSpeechRecognizerAuthorizationStatus = SFSpeechRecognizer.authorizationStatus()
        let permission: String
        switch status {
        case .authorized:
            permission = "granted"
        case .denied, .restricted:
            permission = "denied"
        case .notDetermined:
            permission = "prompt"
        @unknown default:
            permission = "prompt"
        }
        call.resolve(["speechRecognition": permission])
    }

    @objc func requestPermission(_ call: CAPPluginCall) {
        SFSpeechRecognizer.requestAuthorization { (status: SFSpeechRecognizerAuthorizationStatus) in
            DispatchQueue.main.async {
                var speechAuthGranted: Bool = false

                switch(status) {
                case SFSpeechRecognizerAuthorizationStatus.authorized:
                    speechAuthGranted = true
                    break

                case SFSpeechRecognizerAuthorizationStatus.denied:
                    call.reject(self.MESSAGE_ACCESS_DENIED)
                    break

                case SFSpeechRecognizerAuthorizationStatus.restricted:
                    call.reject(self.MESSAGE_RESTRICTED)
                    break

                case SFSpeechRecognizerAuthorizationStatus.notDetermined:
                    call.reject(self.MESSAGE_NOT_DETERMINED)
                    break

                @unknown default:
                    call.reject(self.MESSAGE_UNKNOWN)
                }

                if (!speechAuthGranted) {
                    return
                }

                AVAudioSession.sharedInstance().requestRecordPermission { (granted: Bool) in
                    if (granted) {
                        call.resolve()
                    } else {
                        call.reject(self.MESSAGE_ACCESS_DENIED_MICROPHONE)
                    }
                }
            }

        }
    }

    @objc override public func requestPermissions(_ call: CAPPluginCall) {
        SFSpeechRecognizer.requestAuthorization { (status: SFSpeechRecognizerAuthorizationStatus) in
            DispatchQueue.main.async {
                switch(status) {
                case .authorized:
                    AVAudioSession.sharedInstance().requestRecordPermission { (granted: Bool) in
                        if (granted) {
                            call.resolve(["speechRecognition": "granted"])
                        } else {
                            call.resolve(["speechRecognition": "denied"])
                        }
                    }
                    break
                case .denied, .restricted, .notDetermined:
                    self.checkPermissions(call)
                    break
                @unknown default:
                    self.checkPermissions(call)
                }
            }
        }
    }
}
