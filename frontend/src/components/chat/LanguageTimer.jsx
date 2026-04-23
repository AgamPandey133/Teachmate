import { useState, useEffect } from "react";
import { Timer, X } from "lucide-react";
import { useSocketContext } from "../../context/SocketContext";
import { useChatStore } from "../../store/useChatStore";

const LanguageTimer = () => {
  const { socket } = useSocketContext();
  const { selectedUser } = useChatStore();
  const [endTime, setEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on("timer-update", ({ endTime }) => {
      setEndTime(endTime);
      setShowMenu(false);
    });

    return () => {
      socket.off("timer-update");
    };
  }, [socket]);

  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft("00:00");
        alert("Time's up! Switch languages!");
        setEndTime(null);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const startTimer = (minutes) => {
    socket.emit("timer-start", { to: selectedUser._id, duration: minutes });
  };

  const cancelTimer = () => {
     setEndTime(null);
     setTimeLeft(null);
     // Ideally emit a cancel event too
  };

  return (
    <div className="relative flex items-center">
      {timeLeft ? (
        <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-500">
          <Timer size={16} className="text-emerald-600 dark:text-emerald-400 animate-pulse" />
          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
            {timeLeft}
          </span>
          <button onClick={cancelTimer} className="ml-1 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-full p-0.5">
             <X size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="btn btn-sm btn-ghost btn-circle text-zinc-500 hover:text-emerald-500"
          title="Language Timer"
        >
          <Timer size={20} />
        </button>
      )}

      {showMenu && !timeLeft && (
        <div className="absolute top-10 right-0 bg-base-100 shadow-xl rounded-lg p-2 border border-base-300 z-50 min-w-[150px]">
          <p className="text-xs font-bold text-center mb-2 opacity-70">Set Timer</p>
          <div className="flex flex-col gap-1">
            {[10, 15, 20].map((min) => (
              <button
                key={min}
                onClick={() => startTimer(min)}
                className="btn btn-sm btn-ghost justify-start"
              >
                {min} Minutes
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageTimer;
