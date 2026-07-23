import { useEffect, useRef } from "react";
import { Keyboard, FileText, Mic, MicOff } from "lucide-react";

import useSpeechRecognition from "../../hooks/useSpeechRecognition";

export default function AnswerEditor({
  value,
  setValue,
  disabled,
  onSubmit,
  onVoiceUsed,
}) {
  const textareaRef = useRef(null);
  const { isListening, isSupported, startListening, stopListening } =
    useSpeechRecognition();

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
      <div className="flex items-center gap-3 text-xs text-slate-400">
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
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="
        Explain your approach.
        Include examples, trade-offs, and reasoning...
        "
        className="w-full min-h-[280px] max-h-[500px] resize-none bg-transparent p-6 text-lg leading-8 outline-none placeholder:text-slate-500"
      />

      <div className="flex justify-between px-6 py-4 border-t border-white/10 text-xs text-slate-400">
        <div className="flex gap-4">
          <span>{words} words</span>
          <span>{characters} characters</span>
        </div>
        <span>AI evaluates clarity + accuracy</span>
      </div>
    </div>
  );
}
