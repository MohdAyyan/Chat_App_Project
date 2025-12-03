"use client";

import React, { useState } from "react";
import { channelsAPI, usersAPI } from "@/lib/api";
import toast from "react-hot-toast";

interface SearchResult {
  _id: string;
  name?: string;
  username?: string;
  email?: string;
  type: "channel" | "user";
}

interface Props {
  onChannelSelect?: (channelId: string) => void;
  onUserSelect?: (userId: string) => void;
}

export default function SearchComponent({
  onChannelSelect,
  onUserSelect,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    try {
      const [channels, users] = await Promise.all([
        channelsAPI.search(query).catch(() => []),
        usersAPI.search(query).catch(() => []),
      ]);

      const combinedResults: SearchResult[] = [
        ...(channels || []).map((c: any) => ({
          _id: c._id,
          name: c.name,
          type: "channel" as const,
        })),
        ...(users || []).map((u: any) => ({
          _id: u._id,
          username: u.username,
          email: u.email,
          type: "user" as const,
        })),
      ];

      setResults(combinedResults);
      setShowResults(true);
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchQuery && setShowResults(true)}
          placeholder="Search channels or users..."
          className="w-full px-4 py-2 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
        {searching && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent" />
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg shadow-lg z-50">
          <div className="max-h-64 overflow-y-auto">
            {results.map((result) => (
              <div
                key={result._id}
                onClick={() => {
                  if (result.type === "channel" && onChannelSelect) {
                    onChannelSelect(result._id);
                  } else if (result.type === "user" && onUserSelect) {
                    onUserSelect(result._id);
                  }
                  setSearchQuery("");
                  setResults([]);
                  setShowResults(false);
                }}
                className="p-3 border-b border-white/10 hover:bg-white/20 cursor-pointer transition-colors duration-200 last:border-b-0"
              >
                {result.type === "channel" ? (
                  <div>
                    <p className="text-sm font-medium text-white">
                      # {result.name}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-white">
                      @{result.username}
                    </p>
                    <p className="text-xs text-white/60">{result.email}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showResults && searchQuery && results.length === 0 && !searching && (
        <div className="absolute top-full left-0 right-0 mt-1 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-3 text-center text-white/60 text-sm">
          No results found
        </div>
      )}
    </div>
  );
}
