import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import SimplePeer from "simple-peer";
import { useSocketContext } from "../context/SocketContext";
import useAuthUser from "../hooks/useAuthUser";
import { Mic, MicOff, PhoneOff, Video, VideoOff, Monitor, MonitorOff } from "lucide-react";
import toast from "react-hot-toast";

const CallPage = () => {
  const { id: targetUserId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocketContext();
  const { authUser } = useAuthUser();

  const [stream, setStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [receivingCall, setReceivingCall] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const screenTrackRef = useRef();

  // Check if we are answering a call (data passed from notification)
  const incomingCallData = location.state?.callData;


  useEffect(() => {
    if (!socket) return;
    
    // Only verify media/call when socket is ready
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Camera access not supported. Ensure you are using HTTPS or a supported browser.");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        // Logic split: Answering vs Initiating
        if (incomingCallData) {
          // RECEIVER LOGIC
          // Avoid double-answering if effect re-runs
          if (!connectionRef.current) {
             setReceivingCall(true);
             answerCall(currentStream);
          }
        } else {
          // INITIATOR LOGIC
          // Avoid double-calling
          if (!connectionRef.current) {
             callUser(currentStream);
          }
        }
      })
      .catch((err) => {
        console.error("Error accessing media devices:", err);
        // Add more visible alert for mobile users who might miss toast
        alert("Camera Error: " + err.message); 
        toast.error("Failed to access camera: " + err.message);
      });
      
    // Cleanup on unmount
    return () => {
        if(connectionRef.current) connectionRef.current.destroy();
        // stop tracks
        if(stream) stream.getTracks().forEach(track => track.stop());
    } 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]); // Re-run when socket is ready

  const callUser = (currentStream) => {
    console.log("Initiating call...");
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: currentStream,
    });

    peer.on("signal", (data) => {
      console.log("Generating Offer Signal", data);
      socket.emit("callUser", {
        userToCall: targetUserId,
        signalData: data,
        from: authUser._id,
        name: authUser.fullName,
      });
    });

    peer.on("stream", (remoteStream) => {
      console.log("Received Remote Stream");
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });
    
    peer.on("error", (err) => {
        console.error("Peer Error (Initiator):", err);
        toast.error("Call connection failed");
    });

    peer.on("connect", () => console.log("Peer Connected (Initiator)"));

    socket.on("callAccepted", (signal) => {
      console.log("Call Accepted by remote, processing answer...");
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = (currentStream) => {
    console.log("Answering call...");
    setCallAccepted(true);
    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: currentStream,
    });

    peer.on("signal", (data) => {
      console.log("Generating Answer Signal");
      socket.emit("answerCall", { signal: data, to: incomingCallData.from });
    });

    peer.on("stream", (remoteStream) => {
      console.log("Received Remote Stream");
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    peer.on("error", (err) => {
        console.error("Peer Error (Receiver):", err);
        toast.error("Call connection failed");
    });
    
    peer.on("connect", () => console.log("Peer Connected (Receiver)"));

    console.log("Processing Incoming Offer Signal...");
    peer.signal(incomingCallData.signal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    // Stop local stream
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    navigate("/");
  };
  
    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !micEnabled;
            setMicEnabled(!micEnabled);
        }
    }

    const toggleVideo = () => {
         if (stream) {
            stream.getVideoTracks()[0].enabled = !videoEnabled;
            setVideoEnabled(!videoEnabled);
        }
    }

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = screenStream.getVideoTracks()[0];
                screenTrackRef.current = screenTrack;

                // Stop screen share if user clicks "Stop Sharing" in browser UI
                screenTrack.onended = () => {
                    stopScreenShare();
                };

                if (connectionRef.current) {
                    // Replace video track in peer connection
                    // simple-peer exposes _pc (RTCPeerConnection)
                    const sender = connectionRef.current._pc.getSenders().find(s => s.track.kind === 'video');
                    if (sender) {
                        sender.replaceTrack(screenTrack);
                    }
                }

                if (myVideo.current) {
                    myVideo.current.srcObject = screenStream;
                }
                
                setIsScreenSharing(true);

            } catch (err) {
                console.error("Error sharing screen:", err);
            }
        } else {
            stopScreenShare();
        }
    };

    const stopScreenShare = () => {
        if (screenTrackRef.current) {
            screenTrackRef.current.stop();
        }

        // Revert to camera
        const videoTrack = stream.getVideoTracks()[0];
        
        if (connectionRef.current) {
            const sender = connectionRef.current._pc.getSenders().find(s => s.track.kind === 'video');
            if (sender) {
                sender.replaceTrack(videoTrack);
            }
        }

        if (myVideo.current) {
             myVideo.current.srcObject = stream;
        }

        setIsScreenSharing(false);
    };

  return (
    <div className="h-screen bg-neutral flex flex-col items-center justify-center p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
        {/* MY VIDEO */}
        <div className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-lg">
          <video
            playsInline
            muted
            ref={myVideo}
            autoPlay
            className={`w-full h-full object-cover ${!isScreenSharing ? "transform scale-x-[-1]" : ""}`}
          />
          <div className="absolute bottom-4 left-4 text-white bg-black/50 px-3 py-1 rounded-full">
            You {isScreenSharing && "(Sharing Screen)"}
          </div>
        </div>

        {/* USER VIDEO */}
        <div className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-lg flex items-center justify-center">
            {callAccepted && !callEnded ? (
                 <video
                 playsInline
                 ref={userVideo}
                 autoPlay
                 className="w-full h-full object-cover"
               />
            ) : (
                <div className="text-white text-lg">
                     {incomingCallData ? "Connecting..." : "Calling..."}
                </div>
            )}
            
             {callAccepted && !callEnded && (
                <div className="absolute bottom-4 left-4 text-white bg-black/50 px-3 py-1 rounded-full">
                    {incomingCallData ? incomingCallData.name : "Remote User"}
                </div>
             )}
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex items-center gap-6 mt-8 bg-base-100 p-4 rounded-full shadow-xl">
        <button
            onClick={toggleMic}
            className={`btn btn-circle btn-lg ${micEnabled ? "btn-ghost" : "btn-error"}`}
            title="Toggle Mic"
        >
           {micEnabled ? <Mic /> : <MicOff />}
        </button>

         <button
            onClick={toggleVideo}
            className={`btn btn-circle btn-lg ${videoEnabled ? "btn-ghost" : "btn-error"}`}
             title="Toggle Camera"
        >
             {videoEnabled ? <Video /> : <VideoOff />}
        </button>

         <button
            onClick={toggleScreenShare}
            className={`btn btn-circle btn-lg ${isScreenSharing ? "btn-info" : "btn-ghost"}`}
             title="Share Screen"
        >
             {isScreenSharing ? <MonitorOff /> : <Monitor /> }
        </button>

        <button
          onClick={leaveCall}
          className="btn btn-circle btn-lg btn-error text-white"
           title="End Call"
        >
          <PhoneOff size={32} />
        </button>
      </div>
    </div>
  );
};
export default CallPage;
