import { useEffect, useRef } from "react";
import { Keyboard, Mic, MicOff } from "lucide-react";

import useSpeechRecognition from "../../hooks/useSpeechRecognition";

export default function AnswerEditor({
  value,
  setValue,
  disabled,
  onSubmit,
  onVoiceUsed,
}) {
  const textareaRef = useRef(null);
  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
    syncBaseText,
  } = useSpeechRecognition();

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
      return;
    }
    onVoiceUsed?.(true);
    startListening(value, setValue);
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === "Enter" && onSubmit) {
      onSubmit();
    }
  };

  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  const characters = value.length;

  return (
    <div className="glass rounded-3xl overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 p-4 text-xs text-slate-400">
        {isSupported && (
          <button
            type="button"
            onClick={handleMicToggle}
            disabled={disabled}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition ${
              isListening
                ? "bg-red-500/20 text-red-400"
                : "bg-white/10 text-slate-300"
            }`}
          >
            {isListening ? <MicOff size={14} /> : <Mic size={14} />}
            {isListening ? "Stop" : "Speak"}
          </button>
        )}
        <div className="flex items-center gap-2">
          <Keyboard size={14} />
          Ctrl + Enter
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          setValue(e.target.value);
          syncBaseText(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder="
        Explain your approach.
        Include examples, trade-offs, and reasoning...
        "
        className="min-h-[220px] max-h-[500px] w-full resize-none bg-transparent p-4 text-base leading-7 outline-none placeholder:text-slate-500 sm:min-h-[280px] sm:p-6 sm:text-lg sm:leading-8"
      />

      <div className="flex flex-col gap-2 border-t border-white/10 px-4 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap gap-4">
          <span>{words} words</span>
          <span>{characters} characters</span>
        </div>
        <span>AI evaluates clarity + accuracy</span>
      </div>
    </div>
  );
}
