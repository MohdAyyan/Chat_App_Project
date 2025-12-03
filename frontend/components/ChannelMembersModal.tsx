import React, { useState } from "react";

interface Member {
  _id: string;
  username: string;
  email: string;
}

interface ChannelMembersModalProps {
  channelName: string;
  channelId: string;
  members: Member[];
  isCreator?: boolean;
  onClose: () => void;
  onMemberClick?: (userId: string) => void;
  onInviteClick?: () => void;
}

export default function ChannelMembersModal({
  channelName,
  channelId,
  members,
  isCreator,
  onClose,
  onMemberClick,
  onInviteClick,
}: ChannelMembersModalProps) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const handleMemberClick = (userId: string) => {
    setSelectedMember(userId);
    if (onMemberClick) {
      onMemberClick(userId);
    }
    setTimeout(() => onClose(), 300);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 border border-white/20 rounded-2xl shadow-2xl w-96 max-h-[80vh] overflow-hidden backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            #{channelName}
          </h2>
          <div className="flex items-center gap-2">
            {isCreator && (
              <button
                onClick={onInviteClick}
                className="text-white/70 hover:text-white text-sm transition-colors px-3 py-1 rounded hover:bg-white/10"
                title="Invite users"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            )}
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
        </div>

        {/* Members List */}
        <div className="overflow-y-auto max-h-[calc(80vh-120px)] p-4">
          <p className="text-sm text-white/60 mb-4 font-semibold">
            {members.length} {members.length === 1 ? "member" : "members"}
          </p>

          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-3xl mb-3">👥</div>
              <p className="text-white/60 text-sm">
                No members in this channel
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member._id}
                  onClick={() => handleMemberClick(member._id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                    selectedMember === member._id
                      ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center font-bold text-slate-900 text-sm flex-shrink-0">
                      {member.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {member.username}
                      </p>
                      <p className="text-xs text-white/50 truncate">
                        {member.email}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-white/40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
