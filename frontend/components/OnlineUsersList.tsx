"use client";

import React, { useState, useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { format } from "date-fns";

interface OnlineUser {
  userId: string;
  username: string;
  joinedAt: string;
  isOnline?: boolean;
}

interface Props {
  currentUserId?: string;
}

export default function OnlineUsersList({ currentUserId }: Props) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Receive initial online users list
    socket.on("online-users-list", (users: OnlineUser[]) => {
      setOnlineUsers(users.filter((u) => u.userId !== currentUserId));
    });

    // Handle new user going online
    socket.on("user-online", (data: any) => {
      setOnlineUsers((prev) => {
        const exists = prev.find((u) => u.userId === data.userId);
        if (exists) return prev;
        if (data.userId === currentUserId) return prev;
        return [
          ...prev,
          {
            userId: data.userId,
            username: data.username,
            joinedAt: new Date().toISOString(),
            isOnline: true,
          },
        ];
      });
    });

    // Handle user going offline
    socket.on("user-offline", (data: any) => {
      setOnlineUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    // Handle user typing
    socket.on("user-typing", (data: any) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.add(data.userId);
        return newSet;
      });

      // Clear typing status after 3 seconds
      setTimeout(() => {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }, 3000);
    });

    return () => {
      socket.off("online-users-list");
      socket.off("user-online");
      socket.off("user-offline");
      socket.off("user-typing");
    };
  }, [currentUserId]);

  return (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-3">
      <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">
        Online Users ({onlineUsers.length})
      </h3>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {onlineUsers.length === 0 ? (
          <p className="text-xs text-white/50 text-center py-2">
            No users online
          </p>
        ) : (
          onlineUsers.map((user) => (
            <div
              key={user.userId}
              className="flex items-center space-x-2 p-2 rounded hover:bg-white/10 transition-colors duration-200 group"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 animate-pulse" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.username}
                </p>
                {typingUsers.has(user.userId) && (
                  <p className="text-xs text-blue-400">typing...</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
