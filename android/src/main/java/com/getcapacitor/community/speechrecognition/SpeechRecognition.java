package com.getcapacitor.community.speechrecognition;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Logger;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.locks.ReentrantLock;
import org.json.JSONArray;

@CapacitorPlugin(
  permissions = {
    @Permission(
      strings = { Manifest.permission.RECORD_AUDIO },
      alias = "speechRecognition"
    ),
  }
)
public class SpeechRecognition extends Plugin implements Constants {

  public static final String TAG = "SpeechRecognition";

  private Receiver languageReceiver;
  private SpeechRecognizer speechRecognizer;

  private final ReentrantLock lock = new ReentrantLock();
  private boolean listening = false;

  private JSONArray previousPartialResults = new JSONArray();

  @Override
  public void load() {
    super.load();
    bridge
      .getWebView()
      .post(
        new Runnable() {
          @Override
          public void run() {
            speechRecognizer =
              SpeechRecognizer.createSpeechRecognizer(bridge.getActivity());
            SpeechRecognitionListener listener = new SpeechRecognitionListener();
            speechRecognizer.setRecognitionListener(listener);
            Logger.info(getLogTag(), "Instantiated SpeechRecognizer in load()");
          }
        }
      );
  }

  @PluginMethod
  public void available(PluginCall call) {
    Logger.info(
      getLogTag(),
      "Called for available(): " + isSpeechRecognitionAvailable()
    );
    boolean val = isSpeechRecognitionAvailable();
    JSObject result = new JSObject();
    result.put("available", val);
    call.resolve(result);
  }

  @PluginMethod
  public void start(PluginCall call) {
    if (!isSpeechRecognitionAvailable()) {
      call.unavailable(NOT_AVAILABLE);
      return;
    }

    if (!hasAudioPermissions(RECORD_AUDIO_PERMISSION)) {
      call.reject(MISSING_PERMISSION);
      return;
    }

    String language = call.getString(
      "language",
      Locale.getDefault().toString()
    );
    int maxResults = call.getInt("maxResults", MAX_RESULTS);
    String prompt = call.getString("prompt", null);
    boolean partialResults = call.getBoolean("partialResults", false);
    boolean popup = call.getBoolean("popup", false);
    beginListening(language, maxResults, prompt, partialResults, popup, call);
  }

  @PluginMethod
  public void stop(final PluginCall call) {
    try {
      stopListening();
    } catch (Exception ex) {
      call.reject(ex.getLocalizedMessage());
    }
  }

  @PluginMethod
  public void getSupportedLanguages(PluginCall call) {
    if (languageReceiver == null) {
      languageReceiver = new Receiver(call);
    }

    List<String> supportedLanguages = languageReceiver.getSupportedLanguages();
    if (supportedLanguages != null) {
      JSONArray languages = new JSONArray(supportedLanguages);
      call.resolve(new JSObject().put("languages", languages));
      return;
    }

    Intent detailsIntent = new Intent(
      RecognizerIntent.ACTION_GET_LANGUAGE_DETAILS
    );
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      detailsIntent.setPackage("com.google.android.googlequicksearchbox");
    }
    bridge
      .getActivity()
      .sendOrderedBroadcast(
        detailsIntent,
        null,
        languageReceiver,
        null,
        Activity.RESULT_OK,
        null,
        null
      );
  }

  @PluginMethod
  public void hasPermission(PluginCall call) {
    call.resolve(
      new JSObject()
        .put("permission", hasAudioPermissions(RECORD_AUDIO_PERMISSION))
    );
  }

  @PluginMethod
  public void requestPermission(PluginCall call) {
    if (!hasAudioPermissions(RECORD_AUDIO_PERMISSION)) {
      if (Build.VERSION.SDK_INT > Build.VERSION_CODES.M) {
        bridge
          .getActivity()
          .requestPermissions(
            new String[] { RECORD_AUDIO_PERMISSION },
            REQUEST_CODE_PERMISSION
          );
        call.resolve();
      } else {
        call.resolve();
      }
    }
  }

  @ActivityCallback
  private void listeningResult(PluginCall call, ActivityResult result) {
    if (call == null) {
      return;
    }

    int resultCode = result.getResultCode();
    if (resultCode == Activity.RESULT_OK) {
      try {
        ArrayList<String> matchesList = result
          .getData()
          .getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
        JSObject resultObj = new JSObject();
        resultObj.put("matches", new JSArray(matchesList));
        call.resolve(resultObj);
      } catch (Exception ex) {
        call.reject(ex.getMessage());
      }
    } else {
      call.reject(Integer.toString(resultCode));
    }

    SpeechRecognition.this.lock.lock();
    SpeechRecognition.this.listening(false);
    SpeechRecognition.this.lock.unlock();
  }

  private boolean isSpeechRecognitionAvailable() {
    return SpeechRecognizer.isRecognitionAvailable(bridge.getContext());
  }

  private boolean hasAudioPermissions(String type) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
      return true;
    }

    return hasPermission(type);
  }

  private void listening(boolean value) {
    this.listening = value;
  }

  private void beginListening(
    String language,
    int maxResults,
    String prompt,
    final boolean partialResults,
    boolean showPopup,
    PluginCall call
  ) {
    Logger.info(getLogTag(), "Beginning to listen for audible speech");

    final Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
    intent.putExtra(
      RecognizerIntent.EXTRA_LANGUAGE_MODEL,
      RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
    );
    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, language);
    intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, maxResults);
    intent.putExtra(
      RecognizerIntent.EXTRA_CALLING_PACKAGE,
      bridge.getActivity().getPackageName()
    );
    intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, partialResults);
    intent.putExtra("android.speech.extra.DICTATION_MODE", partialResults);

    if (prompt != null) {
      intent.putExtra(RecognizerIntent.EXTRA_PROMPT, prompt);
    }

    if (showPopup) {
      startActivityForResult(call, intent, "listeningResult");
    } else {
      bridge
        .getWebView()
        .post(() -> {
          try {
            SpeechRecognition.this.lock.lock();

            if (speechRecognizer != null) {
              speechRecognizer.cancel();
              speechRecognizer.destroy();
              speechRecognizer = null;
            }

            speechRecognizer =
              SpeechRecognizer.createSpeechRecognizer(bridge.getActivity());
            SpeechRecognitionListener listener = new SpeechRecognitionListener();
            listener.setCall(call);
            listener.setPartialResults(partialResults);
            speechRecognizer.setRecognitionListener(listener);
            speechRecognizer.startListening(intent);
            SpeechRecognition.this.listening(true);
            if (partialResults) {
              call.resolve();
            }
          } catch (Exception ex) {
            call.reject(ex.getMessage());
          } finally {
            SpeechRecognition.this.lock.unlock();
          }
        });
    }
  }

  private void stopListening() {
    bridge
      .getWebView()
      .post(() -> {
        try {
          SpeechRecognition.this.lock.lock();
          if (SpeechRecognition.this.listening) {
            speechRecognizer.stopListening();
            SpeechRecognition.this.listening(false);
          }
        } catch (Exception ex) {
          throw ex;
        } finally {
          SpeechRecognition.this.lock.unlock();
        }
      });
  }

  private class SpeechRecognitionListener implements RecognitionListener {

    private PluginCall call;
    private boolean partialResults;

    public void setCall(PluginCall call) {
      this.call = call;
    }

    public void setPartialResults(boolean partialResults) {
      this.partialResults = partialResults;
    }

    @Override
    public void onReadyForSpeech(Bundle params) {}

    @Override
    public void onBeginningOfSpeech() {}

    @Override
    public void onRmsChanged(float rmsdB) {}

    @Override
    public void onBufferReceived(byte[] buffer) {}

    @Override
    public void onEndOfSpeech() {}

    @Override
    public void onError(int error) {
      SpeechRecognition.this.stopListening();
      String errorMssg = getErrorText(error);

      if (this.call != null) {
        call.reject(errorMssg);
      }
    }

    @Override
    public void onResults(Bundle results) {
      ArrayList<String> matches = results.getStringArrayList(
        SpeechRecognizer.RESULTS_RECOGNITION
      );

      try {
        JSArray jsArray = new JSArray(matches);

        if (this.call != null) {
          if (!this.partialResults) {
            this.call.resolve(
                new JSObject().put("status", "success").put("matches", jsArray)
              );
          } else {
            JSObject ret = new JSObject();
            ret.put("matches", jsArray);
            notifyListeners("partialResults", ret);
          }
        }
      } catch (Exception ex) {
        this.call.resolve(
            new JSObject()
              .put("status", "error")
              .put("message", ex.getMessage())
          );
      }
    }

    @Override
    public void onPartialResults(Bundle partialResults) {
      ArrayList<String> matches = partialResults.getStringArrayList(
        SpeechRecognizer.RESULTS_RECOGNITION
      );
      JSArray matchesJSON = new JSArray(matches);

      try {
        if (
          matches != null &&
          matches.size() > 0 &&
          !previousPartialResults.equals(matchesJSON)
        ) {
          previousPartialResults = matchesJSON;
          JSObject ret = new JSObject();
          ret.put("matches", previousPartialResults);
          notifyListeners("partialResults", ret);
        }
      } catch (Exception ex) {}
    }

    @Override
    public void onEvent(int eventType, Bundle params) {}
  }

  private String getErrorText(int errorCode) {
    String message;
    switch (errorCode) {
      case SpeechRecognizer.ERROR_AUDIO:
        message = "Audio recording error";
        break;
      case SpeechRecognizer.ERROR_CLIENT:
        message = "Client side error";
        break;
      case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS:
        message = "Insufficient permissions";
        break;
      case SpeechRecognizer.ERROR_NETWORK:
        message = "Network error";
        break;
      case SpeechRecognizer.ERROR_NETWORK_TIMEOUT:
        message = "Network timeout";
        break;
      case SpeechRecognizer.ERROR_NO_MATCH:
        message = "No match";
        break;
      case SpeechRecognizer.ERROR_RECOGNIZER_BUSY:
        message = "RecognitionService busy";
        break;
      case SpeechRecognizer.ERROR_SERVER:
        message = "error from server";
        break;
      case SpeechRecognizer.ERROR_SPEECH_TIMEOUT:
        message = "No speech input";
        break;
      default:
        message = "Didn't understand, please try again.";
        break;
    }
    return message;
  }
}
