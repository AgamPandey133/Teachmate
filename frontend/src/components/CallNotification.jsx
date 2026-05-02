import { useEffect, useState } from "react";
import { useSocketContext } from "../context/SocketContext";
import { Phone, PhoneOff } from "lucide-react";
import { useNavigate } from "react-router";

const CallNotification = () => {
  const { socket } = useSocketContext();
  const [call, setCall] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) {
        console.log("CallNotification: No socket connection yet");
        return;
    }
    
    console.log("CallNotification: Listening for incoming calls on socket", socket.id);

    socket.on("callUser", (data) => {
      console.log("CallNotification: INCOMING CALL RECEIVED", data);
      setCall({
        isReceivingCall: true,
        from: data.from,
        name: data.name,
        signal: data.signal,
      });
    });

    return () => socket.off("callUser");
  }, [socket]);

  const answerCall = () => {
    navigate(`/call/${call.from}`, { state: { callData: call } });
    setCall(null);
  };

  const rejectCall = () => {
    setCall(null);
  };

  if (!call?.isReceivingCall) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-base-100 p-8 rounded-2xl shadow-2xl border border-base-300 w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        
        {/* Pulsing Avatar Container */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
          <div className="absolute inset-0 bg-primary/40 rounded-full animate-pulse scale-110"></div>
          <div className="avatar placeholder relative z-10 ring-4 ring-base-100 rounded-full shadow-lg">
            <div className="bg-primary text-primary-content rounded-full w-24 h-24 flex items-center justify-center text-3xl font-bold">
              <span>{call.name.charAt(0)}</span>
            </div>
          </div>
        </div>

        <h3 className="font-bold text-2xl mb-1">{call.name}</h3>
        <p className="text-zinc-500 mb-8 font-medium tracking-wide">Incoming Video Call...</p>

        <div className="flex gap-4 w-full">
          <button
            onClick={rejectCall}
            className="btn btn-error btn-lg flex-1 text-white gap-2 rounded-xl shadow-lg shadow-error/20 hover:scale-105 transition-transform"
          >
            <PhoneOff size={20} />
            Decline
          </button>
          <button
            onClick={answerCall}
            className="btn btn-success btn-lg flex-1 text-white gap-2 rounded-xl shadow-lg shadow-success/20 hover:scale-105 transition-transform animate-bounce"
          >
            <Phone size={20} className="animate-pulse" />
            Answer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallNotification;
