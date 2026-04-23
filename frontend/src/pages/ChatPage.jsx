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
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <ChatSidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatPage;
