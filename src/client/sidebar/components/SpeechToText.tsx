import React, { useState, useRef, useEffect } from 'react';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import { serverFunctions } from '../../utils/serverFunctions';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

// Define language options
const languageOptions = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'it-IT', label: 'Italian' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
  { value: 'ja-JP', label: 'Japanese' },
  { value: 'ko-KR', label: 'Korean' },
  { value: 'ru-RU', label: 'Russian' },
  { value: 'nl-NL', label: 'Dutch' },
];

const SpeechToText: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('en-US');

  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Use the react-speech-recognition hook with continuous listening
  const {
    transcript,
    listening: isListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition({
    clearTranscriptOnListen: false, // Don't clear automatically
  });

  // Check if browser supports speech recognition
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setError('Speech recognition is not supported in this browser');
    }
  }, [browserSupportsSpeechRecognition]);

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
    }
  };

  const startListening = async () => {
    try {
      setError(null);
      resetTranscript();

      // Start audio visualization
      await setupAudioVisualization();

      // Start the speech recognition with continuous mode
      await SpeechRecognition.startListening({
        continuous: true,
        language: language, // Use selected language
      });

      console.log(`Speech recognition started with language: ${language}`);
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Failed to start speech recognition');
    }
  };

  const stopListening = async () => {
    // First, stop listening
    await SpeechRecognition.stopListening();
    console.log('Speech recognition stopped');

    // Process the final transcript
    try {
      if (transcript && transcript.trim() !== '') {
        setIsSaving(true);
        // Add the full transcript to the document
        await serverFunctions.insertTextToDoc(`${transcript} `);
        // Reset for next recording
        resetTranscript();
        setIsSaving(false);
      }
    } catch (err) {
      console.error('Error inserting text to document:', err);
      setError('Failed to insert text to document');
      setIsSaving(false);
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

  // Handle language change
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    // If currently listening, restart with new language
    if (isListening) {
      SpeechRecognition.stopListening().then(() => {
        startListening();
      });
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      SpeechRecognition.abortListening();
    };
  }, []);

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

  // If browser doesn't support speech recognition
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="w-full p-4 rounded-lg bg-white shadow-sm border border-gray-100">
        <div className="p-3 bg-red-50 border border-red-100 rounded text-red-600">
          Your browser doesn't support speech recognition.
        </div>
      </div>
    );
  }

  // If microphone is not available
  if (!isMicrophoneAvailable) {
    return (
      <div className="w-full p-4 rounded-lg bg-white shadow-sm border border-gray-100">
        <div className="p-3 bg-yellow-50 border border-yellow-100 rounded text-yellow-600">
          Microphone access is needed for speech recognition. Please check your
          browser permissions.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 rounded-lg bg-white shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Speech to Text
      </h2>

      <div className="flex flex-col space-y-4">
        {/* Language selector */}
        <div className="mb-2">
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Language
          </label>
          <Select
            value={language}
            onValueChange={handleLanguageChange}
            disabled={isListening}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isListening && (
            <p className="text-xs text-amber-600 mt-1">
              To change language, stop recording first
            </p>
          )}
        </div>

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
        {transcript && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {transcript}
            </p>
          </div>
        )}

        {/* Status message */}
        <p className="text-xs text-gray-500 mt-2 text-center">
          {isSaving ? (
            <span className="text-blue-500">Writing to document...</span>
          ) : (
            <span>Speak, then stop recording to insert text at cursor</span>
          )}
        </p>

        {/* Instructions */}
        <div className="text-xs text-gray-600 mt-1 p-2 bg-blue-50 rounded-md border border-blue-100">
          <p>
            <strong>How to use:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 mt-1">
            <li>Select your language from the dropdown</li>
            <li>Click "Start Listening" and begin speaking</li>
            <li>Keep speaking continuously to complete your dictation</li>
            <li>Click "Stop Listening" when you're done</li>
            <li>The entire text will be inserted at the cursor position</li>
          </ol>
        </div>

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
