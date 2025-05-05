import React, { useState, useRef, useEffect } from 'react';
import { serverFunctions } from '../../utils/serverFunctions';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

// Create type for SpeechRecognition which may not be in default TypeScript types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface AudioRecorderProps {}

const AudioRecorder: React.FC<AudioRecorderProps> = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [autoSaving, setAutoSaving] = useState<boolean>(false);
  const [lastProcessedText, setLastProcessedText] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser');
      return;
    }

    // Create speech recognition instance
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Set up event handlers
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = '';
      let finalText = transcript;

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText = finalText.concat(result[0].transcript, ' ');
        } else {
          interimText += result[0].transcript;
        }
      }

      setInterimTranscript(interimText);
      setTranscript(finalText);
    };

    recognition.onerror = (event: Event) => {
      console.error('Speech recognition error:', (event as any).error);
    };

    recognition.onend = () => {
      if (isTranscribing) {
        // Restart if we're still supposed to be transcribing
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [transcript, isTranscribing]);

  // Effect for auto-inserting text into document
  useEffect(() => {
    const autoInsertText = async () => {
      // Only process if we have new final text (not interim) and we're recording
      if (isRecording && transcript && transcript !== lastProcessedText) {
        try {
          setAutoSaving(true);
          // Calculate the new text that hasn't been sent yet
          const newText = transcript.substring(lastProcessedText.length);
          if (newText.trim()) {
            await serverFunctions.insertTextToDoc(newText);
            setLastProcessedText(transcript);
          }
        } catch (error) {
          console.error('Error auto-inserting text:', error);
        } finally {
          setAutoSaving(false);
        }
      }
    };

    autoInsertText();
  }, [transcript, isRecording, lastProcessedText]);

  useEffect(() => {
    // Clean up audio URL when component unmounts
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: 'audio/wav',
        });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscript('');
      setInterimTranscript('');
      setLastProcessedText('');

      // Start transcription
      if (recognitionRef.current) {
        setIsTranscribing(true);
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert(
        'Error accessing your microphone. Please check permissions and try again.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop all audio tracks to release the microphone
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());

      // Stop transcription
      if (recognitionRef.current) {
        setIsTranscribing(false);
        recognitionRef.current.stop();
      }
    }
  };

  const handleDownload = () => {
    if (audioBlob && audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = 'recording.wav';
      a.click();
    }
  };

  return (
    <div className="max-w-lg mx-auto p-5 rounded-lg shadow-md bg-white">
      <h2 className="text-center mb-5 text-xl font-semibold text-gray-800">
        Voice Recorder with Auto-Transcription
      </h2>
      <div className="flex flex-col items-center space-y-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="px-5 py-2.5 rounded font-bold cursor-pointer bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isRecording}
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-5 py-2.5 rounded font-bold cursor-pointer bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isRecording}
          >
            Stop Recording
          </button>
        )}

        {/* Status indicator */}
        {isRecording && (
          <div className="flex items-center mt-2 text-sm">
            <div
              className={`h-2 w-2 rounded-full mr-2 ${
                autoSaving ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
              }`}
            ></div>
            <span>
              {autoSaving ? 'Writing to document...' : 'Ready to capture'}
            </span>
          </div>
        )}

        {/* Transcription display area */}
        <div className="w-full mt-4">
          <div className="font-medium text-gray-700 mb-2">
            Transcription:{' '}
            <span className="text-xs text-gray-500">
              (auto-inserted at cursor position)
            </span>
          </div>
          <div className="border rounded-md p-3 bg-gray-50 min-h-[100px] max-h-[200px] overflow-y-auto text-sm">
            {transcript}
            <span className="text-gray-400">{interimTranscript}</span>
          </div>
        </div>

        {audioUrl && (
          <div className="flex flex-col items-center w-full space-y-3">
            <audio src={audioUrl} controls className="w-full" />
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded font-bold cursor-pointer bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Download Recording
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
