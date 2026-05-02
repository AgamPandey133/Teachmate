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
      
    socket.on("callEnded", () => {
        toast("The other person ended the call.");
        navigate("/");
    });

    // Cleanup on unmount
    return () => {
        socket.off("callEnded");
        if(connectionRef.current) connectionRef.current.destroy();
        // stop tracks
        if(stream) stream.getTracks().forEach(track => track.stop());
    } 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, navigate]); // Re-run when socket is ready

  const callUser = (currentStream) => {
    console.log("Initiating call...");
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: currentStream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478" },
        ],
      },
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
        toast.error("Connection failed: " + err.message);
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
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478" },
        ],
      },
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
        toast.error("Connection failed: " + err.message);
    });
    
    peer.on("connect", () => console.log("Peer Connected (Receiver)"));

    console.log("Processing Incoming Offer Signal...");
    peer.signal(incomingCallData.signal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    
    // Notify the other user
    const otherUserId = incomingCallData ? incomingCallData.from : targetUserId;
    if (otherUserId) {
        socket.emit("endCall", { to: otherUserId });
    }

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
    <div className="h-screen w-full bg-neutral flex flex-col p-0 sm:p-4">
      {/* MAIN VIDEO CONTAINER */}
      <div className="relative w-full flex-1 bg-black sm:rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
        
        {/* MAIN BACKGROUND VIDEO */}
        {isScreenSharing ? (
          // If I am sharing screen, my screen is the main background (use contain to avoid cropping screen)
          <video
            playsInline
            muted
            ref={myVideo}
            autoPlay
            className="w-full h-full object-contain bg-zinc-900"
          />
        ) : (
          // Otherwise, the remote user is the main background
          <>
            {callAccepted && !callEnded ? (
              <video
                playsInline
                ref={userVideo}
                autoPlay
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex w-full h-full items-center justify-center text-white text-2xl font-medium tracking-wide bg-zinc-900">
                {incomingCallData ? "Connecting..." : "Calling..."}
              </div>
            )}
          </>
        )}

        {/* PIP FLOATING VIDEO (Remote user when I'm sharing, or My Camera when I'm not) */}
        <div className="absolute bottom-6 right-6 w-32 sm:w-48 md:w-64 aspect-video bg-base-300 rounded-xl overflow-hidden shadow-2xl border-2 border-primary/50 z-10 transition-all duration-300">
          {isScreenSharing ? (
            // If I am sharing screen, remote user is PIP
             callAccepted && !callEnded ? (
                <video
                  playsInline
                  ref={userVideo}
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex w-full h-full items-center justify-center text-xs text-white">
                  Waiting...
                </div>
              )
          ) : (
            // If I am not sharing screen, my camera is PIP
            <video
              playsInline
              muted
              ref={myVideo}
              autoPlay
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          )}
        </div>

        {/* EXTRA PIP FOR LOCAL CAMERA WHEN SCREEN SHARING */}
        {isScreenSharing && stream && (
          <div className="absolute bottom-6 right-40 sm:right-60 md:right-[18rem] w-24 sm:w-32 md:w-48 aspect-video bg-base-300 rounded-xl overflow-hidden shadow-2xl border-2 border-accent/50 z-10 transition-all duration-300">
             <video 
                playsInline 
                muted 
                autoPlay 
                className="w-full h-full object-cover transform scale-x-[-1]" 
                ref={(el) => { if (el) el.srcObject = stream; }}
             />
             <div className="absolute bottom-1 left-1 text-white bg-black/60 px-2 py-0.5 rounded-md text-[10px]">You</div>
          </div>
        )}

        {/* LABELS */}
        {callAccepted && !callEnded && (
          <div className="absolute top-4 left-4 text-white bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium z-10">
             {isScreenSharing ? "You (Sharing Screen)" : (incomingCallData ? incomingCallData.name : "Remote User")}
          </div>
        )}
      </div>

      {/* CONTROLS */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 sm:mt-6 bg-base-100/50 sm:bg-base-100 p-4 sm:rounded-full shadow-xl mx-auto backdrop-blur-md">
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
