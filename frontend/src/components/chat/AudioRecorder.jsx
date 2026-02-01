import { useState, useRef } from "react";
import { Mic, Square, Trash } from "lucide-react";

const AudioRecorder = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
            chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecordingComplete(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not supported.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
  };
  
  const cancelRecording = () => {
     if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop(); // Stop potential stream
        setIsRecording(false);
        chunksRef.current = []; // Discard chunks
        clearInterval(timerRef.current);
        setRecordingTime(0);
     }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2">
      {isRecording ? (
        <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-mono text-red-500">{formatTime(recordingTime)}</span>
            <button onClick={stopRecording} className="p-1 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-full text-red-500">
                <Square size={16} fill="currentColor" />
            </button>
             <button onClick={cancelRecording} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-zinc-500">
                <Trash size={16} />
            </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          className="btn btn-circle btn-sm btn-ghost text-zinc-400 hover:text-emerald-500"
        >
          <Mic size={20} />
        </button>
      )}
    </div>
  );
};

export default AudioRecorder;
