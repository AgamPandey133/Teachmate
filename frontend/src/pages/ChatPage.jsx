import { useEffect } from "react";
import { useParams } from "react-router";
import { useChatStore } from "../store/useChatStore";

import { ChatSidebar } from "../components/chat/ChatSidebar";
import ChatContainer from "../components/chat/ChatContainer";
import NoChatSelected from "../components/chat/NoChatSelected";

const ChatPage = () => {
  const { id } = useParams();
  const { selectedUser, setSelectedUser, getUsers, users } = useChatStore();

  useEffect(() => {
    // If we have an ID but no users loaded, fetch them
    if (users.length === 0) {
      getUsers();
    }
  }, [getUsers, users.length]);

  useEffect(() => {
    if (id && users.length > 0) {
      const user = users.find((u) => u._id === id);
      if (user) {
        setSelectedUser(user);
      }
    } else if (!id) {
        // If no ID in URL, clear selection (optional, but good for consistency)
        setSelectedUser(null);
    }
  }, [id, users, setSelectedUser]);

  return (
    <div className="h-[calc(100vh-4rem)] bg-base-200/30">
      <div className="flex items-center justify-center pt-6 px-4 h-full pb-6">
        <div className="bg-base-100/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-base-content/10 w-full max-w-6xl h-full overflow-hidden">
          <div className="flex h-full">
            <ChatSidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatPage;
