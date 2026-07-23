import { useState, useRef, useCallback, useEffect } from "react";

export default function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  const baseTextRef = useRef("");
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const startListening = useCallback(
    (currentText, onTranscriptUpdate) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 300);

      const recognition = recognitionRef.current;
      if (!recognition || isListening) return;

      baseTextRef.current = currentText ? currentText.trim() + " " : "";

      recognition.onresult = (event) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            final += transcript + " ";
          } else {
            interim += transcript;
          }
        }

        if (final) {
          baseTextRef.current += final;
        }

        onTranscriptUpdate(baseTextRef.current + interim);
      };

      recognition.onerror = (event) => {
        if (event.error !== "no-speech" && event.error !== "aborted") {
          console.error("Speech recognition error:", event.error);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.error("start() threw:", err);
      }
    },
    [isListening],
  );

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition) recognition.stop();
    setIsListening(false);
  }, []);

  return { isListening, isSupported, startListening, stopListening };
}
