"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { channelsAPI, messagesAPI } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { format } from "date-fns";
import toast from "react-hot-toast";
import FloatingShapes from "./FloatingShapes";
import OnlineUsersList from "./OnlineUsersList";
import SearchComponent from "./SearchComponent";
import UserProfile from "./UserProfile";
import ChannelMembersModal from "./ChannelMembersModal";
import InviteUsersModal from "./InviteUsersModal";
import PendingInvites from "./PendingInvites";

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
  };
  channel: string;
  createdAt: string;
  isEdited?: boolean;
}

interface Channel {
  _id: string;
  name: string;
  description?: string;
  isPrivate?: boolean;
  createdBy: {
    _id: string;
    username: string;
  };
  members: Array<{
    _id: string;
    username: string;
  }>;
}

export default function ChatInterface() {
  const { user, logout } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [newChannelPrivate, setNewChannelPrivate] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [selectedUserProfile, setSelectedUserProfile] = useState<string | null>(
    null
  );
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    if (activeChannel) {
      loadMessages(activeChannel._id);
      joinChannel(activeChannel._id);
    }
  }, [activeChannel]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("new-message", (message: Message) => {
      if (message.channel === activeChannel?._id) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
    });

    socket.on("message-edited", (message: Message) => {
      if (message.channel === activeChannel?._id) {
        setMessages((prev) =>
          prev.map((m) => (m._id === message._id ? message : m))
        );
      }
    });

    socket.on("message-deleted", (data: any) => {
      if (data.channelId === activeChannel?._id) {
        setMessages((prev) => prev.filter((m) => m._id !== data.messageId));
      }
    });

    socket.on("user-joined-channel", (data: any) => {
      if (data.channelId === activeChannel?._id) {
        // User joined notification
      }
    });

    socket.on("user-left-channel", (data: any) => {
      if (data.channelId === activeChannel?._id) {
        // User left notification
      }
    });

    return () => {
      socket.off("new-message");
      socket.off("message-edited");
      socket.off("message-deleted");
      socket.off("user-joined-channel");
      socket.off("user-left-channel");
    };
  }, [activeChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChannels = async () => {
    try {
      const data = await channelsAPI.getAll();
      setChannels(data);
      if (data.length > 0 && !activeChannel) {
        setActiveChannel(data[0]);
      }
    } catch (error: any) {
      // Failed to load channels
    }
  };

  const loadMessages = async (channelId: string) => {
    setLoading(true);
    try {
      const data = await channelsAPI.getMessages(channelId);
      setMessages(data.messages || []);
    } catch (error: any) {
      // Failed to load messages
    } finally {
      setLoading(false);
    }
  };

  const joinChannel = (channelId: string) => {
    const socket = getSocket();
    if (socket) {
      socket.emit("join-channel", channelId);
    }
  };

  const leaveChannel = async (channelId: string) => {
    try {
      const socket = getSocket();
      if (socket) {
        socket.emit("leave-channel", channelId);
      }
      await channelsAPI.leave(channelId);
      setActiveChannel(null);
      loadChannels();
    } catch (error: any) {
      // Failed to leave channel
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this channel? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await channelsAPI.delete(channelId);
      if (activeChannel?._id === channelId) {
        setActiveChannel(null);
      }
      loadChannels();
    } catch (error: any) {
      // Failed to delete channel
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingMessageId) {
      handleSaveEdit();
      return;
    }

    if (!messageInput.trim() || !activeChannel) return;

    const socket = getSocket();
    if (socket) {
      socket.emit("send-message", {
        content: messageInput,
        channelId: activeChannel._id,
      });
      setMessageInput("");
    }
  };

  const handleStartEdit = (message: Message) => {
    setEditingMessageId(message._id);
    setEditingContent(message.content);
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !editingContent.trim() || !activeChannel) return;

    try {
      await messagesAPI.update(editingMessageId, editingContent);

      const socket = getSocket();
      if (socket) {
        socket.emit("edit-message", {
          messageId: editingMessageId,
          content: editingContent,
          channelId: activeChannel._id,
        });
      }

      setEditingMessageId(null);
      setEditingContent("");
    } catch (error: any) {
      // Failed to edit message
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!activeChannel) return;

    try {
      await messagesAPI.delete(messageId);

      // Remove message from local state immediately
      setMessages((prev) => prev.filter((m) => m._id !== messageId));

      const socket = getSocket();
      if (socket) {
        socket.emit("delete-message", {
          messageId,
          channelId: activeChannel._id,
        });
      }
    } catch (error: any) {
      // Failed to delete message
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      await channelsAPI.create({
        name: newChannelName,
        description: newChannelDesc,
        isPrivate: newChannelPrivate,
      });
      setShowCreateChannel(false);
      setNewChannelName("");
      setNewChannelDesc("");
      setNewChannelPrivate(false);
      loadChannels();
    } catch (error: any) {
      // Failed to create channel
    }
  };

  const handleJoinChannel = async (channelId: string) => {
    try {
      await channelsAPI.join(channelId);
      const socket = getSocket();
      if (socket) {
        socket.emit("join-channel", channelId);
      }
      loadChannels();
    } catch (error: any) {
      // Failed to join channel
    }
  };

  const handleSearchChannelSelect = async (channelId: string) => {
    try {
      const channel = await channelsAPI.getById(channelId);

      // Just set as active channel without joining
      // User will see the channel with a "Join" button if not a member
      setActiveChannel(channel);
    } catch (error: any) {
      // Failed to open channel
    }
  };
  const handleSearchUserSelect = (userId: string) => {
    setSelectedUserProfile(userId);
  };

  const handleChannelNameClick = () => {
    if (!activeChannel) return;
    (async () => {
      try {
        const channel = await channelsAPI.getById(activeChannel._id);
        // ensure we have populated members
        setActiveChannel(channel);
      } catch (err) {
        // ignore - fall back to existing activeChannel
      } finally {
        setShowMembersModal(true);
      }
    })();
  };

  const handleMemberSelect = (userId: string) => {
    setSelectedUserProfile(userId);
  };
  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      <FloatingShapes />

      {/* Sidebar - Redesigned */}
      <div className="w-72 backdrop-blur-2xl bg-gradient-to-b from-slate-900/95 via-purple-900/40 to-slate-900/95 border-r border-purple-500/20 flex flex-col relative z-10 overflow-hidden">
        {/* Header Section */}
        <div className="p-5 border-b border-purple-500/10 flex-shrink-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/50">
                💬
              </div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                Team Chat
              </h1>
            </div>
            <button
              onClick={() => setShowCreateChannel(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/50 hover:shadow-purple-500/80 transition-all duration-300 hover:scale-110 transform active:scale-95"
              title="Create Channel"
              data-hoverable
            >
              +
            </button>
          </div>

          {/* User Profile Card */}
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-purple-200/70 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <a
                href="/"
                className="flex-1 text-xs font-semibold text-purple-300 hover:text-white bg-white/5 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 rounded-lg py-2 px-2 transition-all duration-200 flex items-center justify-center gap-1"
                title="Back to Home"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Home
              </a>
              <button
                onClick={logout}
                className="flex-1 text-xs font-semibold text-red-300 hover:text-red-200 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-lg py-2 px-2 transition-all duration-200 flex items-center justify-center gap-1"
                title="Logout"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Channels Section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 uppercase tracking-widest">
                📌 Channels
              </h2>
              <span className="text-xs font-bold text-purple-300 bg-purple-500/20 border border-purple-500/30 rounded-full px-2 py-0.5">
                {channels.length}
              </span>
            </div>

            {channels.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-white/60 text-sm">No channels yet</p>
                <button
                  onClick={() => setShowCreateChannel(true)}
                  className="mt-3 text-xs font-bold text-purple-300 hover:text-purple-200 underline hover:no-underline"
                >
                  Create one now
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {channels.map((channel) => (
                  <div
                    key={channel._id}
                    onClick={() => setActiveChannel(channel)}
                    className={`rounded-xl cursor-pointer transition-all duration-300 group ${
                      activeChannel?._id === channel._id
                        ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-2 border-purple-500/50 shadow-lg shadow-purple-500/30"
                        : "bg-white/5 border border-purple-500/10 hover:bg-white/10 hover:border-purple-500/30"
                    }`}
                    data-hoverable
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-purple-300 font-bold">#</span>
                            <span
                              className={`font-bold truncate transition-colors ${
                                activeChannel?._id === channel._id
                                  ? "text-white"
                                  : "text-white/80 group-hover:text-white"
                              }`}
                            >
                              {channel.name}
                            </span>
                            {channel.isPrivate && (
                              <span className="text-xs text-pink-400">🔒</span>
                            )}
                          </div>
                          {channel.description && (
                            <p className="text-xs text-white/50 line-clamp-1 ml-5">
                              {channel.description}
                            </p>
                          )}
                          <div className="text-xs text-purple-300/60 ml-5 mt-1">
                            {channel.members.length}{" "}
                            {channel.members.length === 1
                              ? "member"
                              : "members"}
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex gap-2">
                          {!channel.members.find((m) => m._id === user?._id) ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinChannel(channel._id);
                              }}
                              className="text-xs font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-3 py-1.5 rounded-lg transition-all duration-200 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 whitespace-nowrap"
                            >
                              Join
                            </button>
                          ) : activeChannel?._id === channel._id ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  leaveChannel(channel._id);
                                }}
                                className="text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 px-3 py-1.5 rounded-lg transition-all duration-200 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 whitespace-nowrap"
                              >
                                Leave
                              </button>
                              {channel.createdBy._id === user?._id && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteChannel(channel._id);
                                  }}
                                  className="text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-3 py-1.5 rounded-lg transition-all duration-200 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 whitespace-nowrap flex items-center gap-1"
                                  title="Delete channel"
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                                  </svg>
                                  Delete
                                </button>
                              )}
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {activeChannel ? (
          <>
            {/* Channel Header - Redesigned */}
            <div className="backdrop-blur-xl bg-white/10 border-b border-white/20 p-4 flex-shrink-0">
              <div className="flex items-center justify-between gap-4">
                <div
                  className="flex-1 min-w-0 cursor-pointer group transition-all duration-200 hover:opacity-80"
                  onClick={handleChannelNameClick}
                  title={`Click to view ${activeChannel.members.length} members`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-transform">
                      {activeChannel.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-white">
                          # {activeChannel.name}
                        </h2>
                        <svg
                          className="w-4 h-4 text-white/50 group-hover:text-white/80 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {activeChannel.description && (
                          <p className="text-xs text-white/60">
                            {activeChannel.description}
                          </p>
                        )}
                        <p className="text-xs text-white/40">
                          ({activeChannel.members.length}{" "}
                          {activeChannel.members.length === 1
                            ? "member"
                            : "members"}
                          )
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <SearchComponent
                    onChannelSelect={handleSearchChannelSelect}
                    onUserSelect={handleSearchUserSelect}
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 flex gap-4 p-4 overflow-hidden">
              {/* Messages Area - Redesigned */}
              <div className="flex-1 flex flex-col">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="inline-block backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-6">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400 border-t-cyan-400 mx-auto mb-3"></div>
                          <p className="text-white/60">Loading messages...</p>
                        </div>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="inline-block backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-12">
                          <div className="text-4xl mb-3">💬</div>
                          <p className="text-lg font-semibold text-white mb-2">
                            No messages yet
                          </p>
                          <p className="text-white/60 text-sm">
                            Start the conversation by sending a message
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message._id}
                        className="flex gap-3 group hover:bg-white/5 rounded-lg p-2 transition-colors duration-200"
                      >
                        <div
                          onClick={() =>
                            setSelectedUserProfile(message.sender._id)
                          }
                          className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-lg cursor-pointer hover:scale-110 transition-transform"
                        >
                          {message.sender.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              onClick={() =>
                                setSelectedUserProfile(message.sender._id)
                              }
                              className="font-semibold text-white cursor-pointer hover:text-cyan-400 transition-colors text-sm"
                            >
                              {message.sender.username}
                            </span>
                            <span className="text-xs text-white/50">
                              {format(
                                new Date(message.createdAt),
                                "MMM d, h:mm a"
                              )}
                            </span>
                            {message.isEdited && (
                              <span className="text-xs text-white/40 italic">
                                (edited)
                              </span>
                            )}
                          </div>
                          <p className="text-white/90 text-sm leading-relaxed">
                            {message.content}
                          </p>

                          {/* Edit/Delete buttons for own messages */}
                          {message.sender._id === user?._id && (
                            <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleStartEdit(message)}
                                className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded backdrop-blur-lg bg-white/10 hover:bg-white/20 transition-all duration-200 font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(message._id)}
                                className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded backdrop-blur-lg bg-white/10 hover:bg-red-500/20 transition-all duration-200 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Area - Redesigned */}
                <div className="backdrop-blur-xl bg-white/10 border-t border-white/20 p-4 flex-shrink-0 mt-2 rounded-t-xl">
                  {editingMessageId && (
                    <div className="mb-3 p-3 bg-blue-500/20 border-l-4 border-blue-500 rounded-lg text-sm text-blue-200 flex items-center justify-between">
                      <span>✏️ Editing message</span>
                      <button
                        onClick={() => {
                          setEditingMessageId(null);
                          setEditingContent("");
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={editingMessageId ? editingContent : messageInput}
                      onChange={(e) =>
                        editingMessageId
                          ? setEditingContent(e.target.value)
                          : setMessageInput(e.target.value)
                      }
                      placeholder={
                        editingMessageId
                          ? "Edit your message..."
                          : "Type a message..."
                      }
                      className="flex-1 px-4 py-3 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={
                        editingMessageId
                          ? !editingContent.trim()
                          : !messageInput.trim()
                      }
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50 font-medium text-sm whitespace-nowrap"
                      data-hoverable
                    >
                      {editingMessageId ? "💾 Save" : "📤 Send"}
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Sidebar - Online Users - Redesigned */}
              <div className="w-60 flex flex-col gap-3 overflow-y-auto pr-2">
                <div className="flex-shrink-0">
                  <OnlineUsersList currentUserId={user?._id} />
                </div>

                {selectedUserProfile && (
                  <div className="flex-shrink-0">
                    <UserProfile
                      userId={selectedUserProfile}
                      onClose={() => setSelectedUserProfile(null)}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block backdrop-blur-lg bg-white/5 border border-white/10 rounded-3xl p-12">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-xl font-semibold text-white mb-2">
                  Welcome to Team Chat
                </p>
                <p className="text-white/60">
                  Select a channel from the sidebar to start chatting
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl relative overflow-hidden">
            {/* Modal background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 pointer-events-none" />

            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Create New Channel
              </h3>
              <form onSubmit={handleCreateChannel}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Channel Name
                  </label>
                  <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className="w-full px-4 py-3 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., general"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={newChannelDesc}
                    onChange={(e) => setNewChannelDesc(e.target.value)}
                    className="w-full px-4 py-3 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Channel description"
                  />
                </div>
                <div className="mb-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative inline-flex">
                      <input
                        type="checkbox"
                        checked={newChannelPrivate}
                        onChange={(e) => setNewChannelPrivate(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                          newChannelPrivate ? "bg-red-500/70" : "bg-white/20"
                        }`}
                      />
                      <span
                        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                          newChannelPrivate ? "translate-x-6" : ""
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                      {newChannelPrivate
                        ? "🔒 Private Channel"
                        : "🌐 Public Channel"}
                    </span>
                  </label>
                  <p className="text-xs text-white/60 mt-2">
                    {newChannelPrivate
                      ? "Only invited members can join"
                      : "Anyone can search and join this channel"}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateChannel(false);
                      setNewChannelName("");
                      setNewChannelDesc("");
                      setNewChannelPrivate(false);
                    }}
                    className="flex-1 px-4 py-3 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 text-white transition-all duration-200 font-medium"
                    data-hoverable
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50 font-medium"
                    data-hoverable
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Channel Members Modal */}
      {showMembersModal && activeChannel && (
        <ChannelMembersModal
          channelName={activeChannel.name}
          channelId={activeChannel._id}
          //@ts-ignore
          members={activeChannel.members}
          isCreator={activeChannel.createdBy._id === user?._id}
          onClose={() => setShowMembersModal(false)}
          onMemberClick={handleMemberSelect}
          onInviteClick={() => {
            setShowMembersModal(false);
            setShowInviteModal(true);
          }}
        />
      )}

      {/* Invite Users Modal */}
      {showInviteModal && activeChannel && (
        <InviteUsersModal
          channelId={activeChannel._id}
          channelName={activeChannel.name}
          //@ts-ignore
          currentMembers={activeChannel.members}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            loadChannels();
          }}
        />
      )}

      {/* Pending Invites Notifications */}
      <PendingInvites
        onInviteAccepted={() => {
          loadChannels();
        }}
      />
    </div>
  );
}
