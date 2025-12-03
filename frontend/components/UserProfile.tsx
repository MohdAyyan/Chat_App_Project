"use client";

import React, { useEffect, useState } from "react";
import { usersAPI } from "@/lib/api";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
}

interface Props {
  userId: string;
  onClose?: () => void;
}

export default function UserProfile({ userId, onClose }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await usersAPI.getById(userId);
        setUser(userData);
      } catch (error) {
        toast.error("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-4">
        <p className="text-white/60">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-4">
        <p className="text-white/60">User not found</p>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {user.username}
            </h3>
            <p className="text-sm text-white/60">{user.email}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-2 border-t border-white/10 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Status:</span>
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                user.isOnline ? "bg-green-400" : "bg-gray-400"
              }`}
            />
            <span className="text-sm font-medium text-white">
              {user.isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        {!user.isOnline && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Last Seen:</span>
            <span className="text-sm text-white">
              {format(new Date(user.lastSeen), "MMM d, h:mm a")}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Joined:</span>
          <span className="text-sm text-white">
            {format(new Date(user.createdAt), "MMM d, yyyy")}
          </span>
        </div>
      </div>
    </div>
  );
}
