import { useEffect, useState } from "react";
import { useChatStore } from "../../store/useChatStore";

// I need useSocketContext for onlineUsers.
import { useSocketContext } from "../../context/SocketContext";
import { Users } from "lucide-react";
import AvatarImage from "../AvatarImage";

export const ChatSidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { onlineUsers } = useSocketContext();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-80 border-r border-base-content/10 flex flex-col transition-all duration-200 bg-base-200/30">
      <div className="border-b border-base-content/10 w-full p-5 bg-base-100/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
             <Users className="size-5 text-primary" />
          </div>
          <span className="font-bold hidden lg:block text-lg">Conversations</span>
        </div>
        {/* Online filter toggle */}
        <div className="mt-4 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2 bg-base-200 px-3 py-1.5 rounded-lg border border-base-content/10 hover:border-primary/30 transition-all">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm checkbox-primary rounded-md"
            />
            <span className="text-sm font-medium">Online only</span>
          </label>
          <span className="text-xs font-semibold bg-success/20 text-success px-2 py-0.5 rounded-full">
            {Math.max(0, onlineUsers.length - 1)} online
          </span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3 px-2 space-y-1">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-4 rounded-xl
              transition-all duration-200 border border-transparent
              ${
                selectedUser?._id === user._id
                  ? "bg-primary/10 border-primary/30 shadow-sm"
                  : "hover:bg-base-200 hover:border-base-content/10"
              }
            `}
          >
            <div className="relative mx-auto lg:mx-0 shrink-0">
              <div className="size-12 rounded-full overflow-hidden">
                <AvatarImage profilePic={user.profilePic} fullName={user.fullName} />
              </div>
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900 z-10"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};

const SidebarSkeleton = () => {
  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
      </div>

      {/* Skeleton Contacts */}
      <div className="overflow-y-auto w-full py-3">
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="w-full p-3 flex items-center gap-3">
            {/* Avatar skeleton */}
            <div className="relative mx-auto lg:mx-0">
              <div className="skeleton size-12 rounded-full" />
            </div>

            {/* User info skeleton - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="skeleton h-4 w-32 mb-2" />
              <div className="skeleton h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
