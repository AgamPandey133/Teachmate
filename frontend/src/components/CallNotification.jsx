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
    <div className="fixed top-4 right-4 z-50 bg-base-100 p-4 rounded-lg shadow-lg border border-base-300 w-80 animate-slide-in">
      <div className="flex items-center gap-4">
        <div className="avatar placeholder">
          <div className="bg-neutral text-neutral-content rounded-full w-12">
            <span>{call.name.charAt(0)}</span>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-lg">{call.name}</h3>
          <p className="text-sm opacity-70">Incoming Video Call...</p>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={rejectCall}
          className="btn btn-error btn-sm flex-1 text-white gap-2"
        >
          <PhoneOff size={16} />
          Decline
        </button>
        <button
          onClick={answerCall}
          className="btn btn-success btn-sm flex-1 text-white gap-2"
        >
          <Phone size={16} />
          Answer
        </button>
      </div>
    </div>
  );
};

export default CallNotification;
