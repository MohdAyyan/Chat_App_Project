import React, { useState, useEffect } from "react";
import { usersAPI, invitesAPI } from "@/lib/api";

interface User {
  _id: string;
  username: string;
  email: string;
}

interface InviteUsersModalProps {
  channelId: string;
  channelName: string;
  currentMembers: User[];
  onClose: () => void;
  onSuccess?: () => void;
}

export default function InviteUsersModal({
  channelId,
  channelName,
  currentMembers,
  onClose,
  onSuccess,
}: InviteUsersModalProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const users = await usersAPI.getAll();
      // Filter out current members
      const memberIds = currentMembers.map((m) => m._id);
      const nonMembers = users.filter((u: User) => !memberIds.includes(u._id));
      setAllUsers(nonMembers);
    } catch (error) {
      setMessage("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = allUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleInvite = async () => {
    if (selectedUsers.length === 0) {
      setMessage("Select at least one user");
      return;
    }

    try {
      setInviting(true);
      setMessage("");

      // Send invite requests to each selected user
      for (const userId of selectedUsers) {
        try {
          await invitesAPI.send(channelId, userId);
        } catch (err) {
          // Continue with other invites even if one fails
          console.error(`Failed to invite user ${userId}:`, err);
        }
      }

      setMessage("Invites sent successfully!");
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Failed to send invites");
    } finally {
      setInviting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 border border-white/20 rounded-2xl shadow-2xl w-96 max-h-[80vh] overflow-hidden backdrop-blur-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Invite to #{channelName}
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
          />
        </div>

        {/* Users List */}
        <div className="overflow-y-auto flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-400 border-t-cyan-400"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60 text-sm">
                {searchQuery
                  ? "No users found matching your search"
                  : "All available users are already members"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => toggleUser(user._id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border flex items-center gap-3 ${
                    selectedUsers.includes(user._id)
                      ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => {}}
                    className="w-4 h-4 rounded cursor-pointer accent-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">
                      {user.username}
                    </p>
                    <p className="text-xs text-white/50 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex-shrink-0 space-y-3">
          {message && (
            <div
              className={`text-sm p-2 rounded-lg text-center ${
                message.includes("successfully")
                  ? "bg-green-500/20 text-green-200"
                  : "bg-red-500/20 text-red-200"
              }`}
            >
              {message}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 text-white transition-all duration-200 font-medium text-sm disabled:opacity-50"
              disabled={inviting}
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={inviting || selectedUsers.length === 0}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {inviting ? "Inviting..." : `Invite (${selectedUsers.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
