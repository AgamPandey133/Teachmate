import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./MessageSkeleton";
import useAuthUser from "../../hooks/useAuthUser";
import { useSocketContext } from "../../context/SocketContext";
import { formatMessageTime } from "../../lib/utils";
import { BookMarked } from "lucide-react";
import toast from "react-hot-toast";
import { addWordToNotebook } from "../../lib/api";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthUser();
  const { socket } = useSocketContext();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages(socket);

    return () => unsubscribeFromMessages(socket);
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
    socket,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      const scroll = () => messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      // Small timeout to ensure DOM update
        setTimeout(scroll, 100);
    }
  }, [messages]);

  const handleSaveToNotebook = async (messageText) => {
     // Ideally, we'd selection text, but for mobile/simplicity, let's prompt
     const word = prompt("Enter the word or phrase to save:", messageText);
     if (!word) return;
     
     const translation = prompt("Enter translation (optional):");

     try {
         await addWordToNotebook({ word, translation, originalContext: messageText });
         toast.success("Saved to your Notebook!");
     } catch (err) {
         toast.error("Failed to save word");
         console.error(err);
     }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col group relative">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.audioUrl && (
                <audio controls src={message.audioUrl} className="w-full sm:w-[250px] mb-2" />
              )}
              {message.text && (
                  <>
                    <p>{message.text}</p>
                    {/* Save to Notebook Button - visible on hover or always on mobile? Group-hover for desktop */}
                    <button 
                        onClick={() => handleSaveToNotebook(message.text)}
                        className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-zinc-400 hover:text-emerald-500"
                        title="Save to Notebook"
                    >
                        <BookMarked size={16} />
                    </button>
                  </>
              )}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
