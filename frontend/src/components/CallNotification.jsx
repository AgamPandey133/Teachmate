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
    <div className="fixed top-20 right-4 sm:right-8 z-[100] bg-base-100 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-base-300 w-80 animate-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-4 mb-4">
        {/* Pulsing Avatar */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
          <div className="avatar placeholder relative z-10">
            <div className="bg-primary text-primary-content rounded-full w-14 h-14 flex items-center justify-center text-xl font-bold">
              <span>{call.name.charAt(0)}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold text-lg leading-tight">{call.name}</h3>
          <p className="text-sm text-zinc-500 font-medium">Incoming Video Call...</p>
        </div>
      </div>
      
      <div className="flex gap-3 mt-2">
        <button
          onClick={rejectCall}
          className="btn btn-error btn-sm flex-1 text-white gap-1 rounded-xl shadow-sm hover:scale-105 transition-transform"
        >
          <PhoneOff size={16} />
          Decline
        </button>
        <button
          onClick={answerCall}
          className="btn btn-success btn-sm flex-1 text-white gap-1 rounded-xl shadow-sm hover:scale-105 transition-transform animate-bounce"
        >
          <Phone size={16} />
          Answer
        </button>
      </div>
    </div>
  );
};

export default CallNotification;
