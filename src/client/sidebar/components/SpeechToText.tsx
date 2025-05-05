import React, { useState, useRef, useEffect } from 'react';
import { serverFunctions } from '../../utils/serverFunctions';
import { Button } from '../../components/ui/button';

// Define SpeechRecognition types
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const SpeechToText: React.FC = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastProcessedTextRef = useRef<string>('');

  // Initialize speech recognition
  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    // Create speech recognition instance
    const recognition = new SpeechRecognitionCtor();
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

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setError(`Recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        // Restart if we're still supposed to be listening
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    const cleanup = () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };

    cleanup();
  }, [transcript, isListening]);

  // Effect for auto-inserting text into document
  useEffect(() => {
    const autoInsertText = async () => {
      // Only process if we have new final text (not interim) and we're listening
      if (
        isListening &&
        transcript &&
        transcript !== lastProcessedTextRef.current
      ) {
        try {
          setIsSaving(true);
          // Calculate the new text that hasn't been sent yet
          const newText = transcript.substring(
            lastProcessedTextRef.current.length
          );
          if (newText.trim()) {
            await serverFunctions.insertTextToDoc(newText);
            lastProcessedTextRef.current = transcript;
          }
        } catch (err) {
          console.error('Error inserting text to document:', err);
          setError('Failed to insert text at cursor position');
        } finally {
          setIsSaving(false);
        }
      }
    };

    autoInsertText();
  }, [transcript, isListening]);

  // Set up audio visualization
  const setupAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      analyserRef.current = analyser;

      // Start audio level monitoring
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateAudioLevel = () => {
        if (!isListening) return;

        analyser.getByteFrequencyData(dataArray);

        // Calculate average level
        let sum = 0;
        for (let i = 0; i < dataArray.length; i += 1) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        setAudioLevel(average);

        // Continue animation loop
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError(
        'Error accessing your microphone. Please check permissions and try again.'
      );
      setIsListening(false);
    }
  };

  const startListening = async () => {
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    lastProcessedTextRef.current = '';
    setIsListening(true);

    // Start audio visualization
    await setupAudioVisualization();

    // Start recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        setError('Failed to start speech recognition');
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    setIsListening(false);

    // Stop recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Stop audio visualization
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop microphone stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Generate visualization bars based on audio level
  const generateVisualizationBars = () => {
    const barCount = 5;
    const activeBars = Math.ceil((audioLevel / 100) * barCount);

    return Array.from({ length: barCount }).map((_, index) => (
      <div
        key={index}
        className={`h-${
          index + 2
        } w-1 mx-0.5 rounded-full transition-colors duration-150 ${
          index < activeBars ? 'bg-primary' : 'bg-gray-200'
        }`}
      />
    ));
  };

  return (
    <div className="w-full p-4 rounded-lg bg-white shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Speech to Text
      </h2>

      <div className="flex flex-col space-y-4">
        {/* Recording status and visualization */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div
              className={`h-3 w-3 rounded-full mr-2 ${
                isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
              }`}
            />
            <span className="text-sm text-gray-600">
              {isListening ? 'Recording...' : 'Not recording'}
            </span>
          </div>

          {isListening && (
            <div className="flex items-end h-5">
              {generateVisualizationBars()}
            </div>
          )}
        </div>

        {/* Action button */}
        <Button
          onClick={isListening ? stopListening : startListening}
          variant={isListening ? 'destructive' : 'default'}
          className="w-full"
          disabled={!!error && !isListening}
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </Button>

        {/* Transcription display */}
        {(transcript || interimTranscript) && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {transcript}
              <span className="text-gray-400">{interimTranscript}</span>
            </p>
          </div>
        )}

        {/* Status message */}
        <p className="text-xs text-gray-500 mt-2 text-center">
          {isSaving ? (
            <span className="text-blue-500">Writing to cursor position...</span>
          ) : (
            <span>Transcribed text will be written at cursor position</span>
          )}
        </p>

        {/* Error message */}
        {error && (
          <div className="p-2 mt-2 bg-red-50 border border-red-100 rounded text-red-600 text-xs">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechToText;
