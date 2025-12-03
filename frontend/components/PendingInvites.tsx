import React, { useState, useEffect } from "react";
import { invitesAPI } from "@/lib/api";

interface Invite {
  _id: string;
  channel: {
    _id: string;
    name: string;
    description?: string;
  };
  invitedBy: {
    username: string;
    email: string;
  };
  status: string;
  createdAt: string;
}

interface PendingInvitesProps {
  onInviteAccepted?: () => void;
}

export default function PendingInvites({
  onInviteAccepted,
}: PendingInvitesProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    try {
      setLoading(true);
      const data = await invitesAPI.getPending();
      setInvites(data);
    } catch (error) {
      console.error("Failed to load invites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (inviteId: string) => {
    try {
      setProcessingId(inviteId);
      await invitesAPI.accept(inviteId);
      setInvites((prev) => prev.filter((i) => i._id !== inviteId));
      if (onInviteAccepted) {
        onInviteAccepted();
      }
    } catch (error) {
      console.error("Failed to accept invite:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (inviteId: string) => {
    try {
      setProcessingId(inviteId);
      await invitesAPI.reject(inviteId);
      setInvites((prev) => prev.filter((i) => i._id !== inviteId));
    } catch (error) {
      console.error("Failed to reject invite:", error);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return null;
  }

  if (invites.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-h-96 overflow-y-auto space-y-3 z-40">
      {invites.map((invite) => (
        <div
          key={invite._id}
          className="backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-4 shadow-lg shadow-blue-500/10 animate-in fade-in slide-in-from-right-4"
        >
          <div className="mb-3">
            <p className="font-semibold text-white text-sm">
              📬 Channel Invite
            </p>
            <p className="text-blue-200 text-sm font-medium">
              #{invite.channel.name}
            </p>
            <p className="text-white/70 text-xs mt-1">
              Invited by {invite.invitedBy.username}
            </p>
            {invite.channel.description && (
              <p className="text-white/60 text-xs mt-1 line-clamp-1">
                {invite.channel.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAccept(invite._id)}
              disabled={processingId === invite._id}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processingId === invite._id ? "..." : "Accept"}
            </button>
            <button
              onClick={() => handleReject(invite._id)}
              disabled={processingId === invite._id}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 text-white text-xs font-medium rounded-lg hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processingId === invite._id ? "..." : "Reject"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
