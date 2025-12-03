const mongoose = require("mongoose");

const channelInviteSchema = new mongoose.Schema(
  {
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invitedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index to prevent duplicate invites
channelInviteSchema.index({ channel: 1, invitedUser: 1, status: 1 });

module.exports = mongoose.model("ChannelInvite", channelInviteSchema);
