const express = require("express");
const ChannelInvite = require("../models/ChannelInvite");
const Channel = require("../models/Channel");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/invites/send
// @desc    Send a channel invite to a user
router.post("/send", protect, async (req, res) => {
  try {
    const { channelId, userId } = req.body;

    // Check if channel exists and user is creator
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (channel.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only channel creator can send invites" });
    }

    // Check if user is already a member
    if (channel.members.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User is already a member of this channel" });
    }

    // Check if invite already exists
    const existingInvite = await ChannelInvite.findOne({
      channel: channelId,
      invitedUser: userId,
      status: "pending",
    });

    if (existingInvite) {
      return res
        .status(400)
        .json({ message: "Invite already sent to this user" });
    }

    // Create new invite
    const invite = await ChannelInvite.create({
      channel: channelId,
      invitedBy: req.user._id,
      invitedUser: userId,
      status: "pending",
    });

    const populatedInvite = await ChannelInvite.findById(invite._id)
      .populate("channel", "name description")
      .populate("invitedBy", "username email")
      .populate("invitedUser", "username email");

    res.status(201).json(populatedInvite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/invites/pending
// @desc    Get all pending invites for the current user
router.get("/pending", protect, async (req, res) => {
  try {
    const invites = await ChannelInvite.find({
      invitedUser: req.user._id,
      status: "pending",
    })
      .populate("channel", "name description createdBy")
      .populate("invitedBy", "username email")
      .sort({ createdAt: -1 });

    res.json(invites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/invites/:id/accept
// @desc    Accept a channel invite
router.post("/:id/accept", protect, async (req, res) => {
  try {
    const invite = await ChannelInvite.findById(req.params.id);

    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }

    if (invite.invitedUser.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only accept invites sent to you" });
    }

    if (invite.status !== "pending") {
      return res
        .status(400)
        .json({ message: `This invite has already been ${invite.status}` });
    }

    // Add user to channel members
    const channel = await Channel.findById(invite.channel);
    if (!channel.members.includes(req.user._id)) {
      channel.members.push(req.user._id);
      await channel.save();
    }

    // Update invite status
    invite.status = "accepted";
    await invite.save();

    const populatedInvite = await ChannelInvite.findById(invite._id)
      .populate("channel", "name description")
      .populate("invitedBy", "username email")
      .populate("invitedUser", "username email");

    res.json(populatedInvite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/invites/:id/reject
// @desc    Reject a channel invite
router.post("/:id/reject", protect, async (req, res) => {
  try {
    const invite = await ChannelInvite.findById(req.params.id);

    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }

    if (invite.invitedUser.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only reject invites sent to you" });
    }

    if (invite.status !== "pending") {
      return res
        .status(400)
        .json({ message: `This invite has already been ${invite.status}` });
    }

    // Update invite status
    invite.status = "rejected";
    await invite.save();

    const populatedInvite = await ChannelInvite.findById(invite._id)
      .populate("channel", "name description")
      .populate("invitedBy", "username email")
      .populate("invitedUser", "username email");

    res.json(populatedInvite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
