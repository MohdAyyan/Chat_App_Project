const express = require("express");
const Channel = require("../models/Channel");
const Message = require("../models/Message");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/channels
// @desc    Get all channels
router.get("/", protect, async (req, res) => {
  try {
    const channels = await Channel.find({
      $or: [
        { isPrivate: false },
        { members: req.user._id },
        { createdBy: req.user._id },
      ],
    })
      .populate("createdBy", "username email")
      .populate("members", "username email");

    res.json(channels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/channels
// @desc    Create a new channel
router.post("/", protect, async (req, res) => {
  try {
    const { name, description, isPrivate, members } = req.body;

    const channelExists = await Channel.findOne({ name });
    if (channelExists) {
      return res
        .status(400)
        .json({ message: "Channel with this name already exists" });
    }

    const channel = await Channel.create({
      name,
      description: description || "",
      createdBy: req.user._id,
      members: members || [],
      isPrivate: isPrivate || false,
    });

    const populatedChannel = await Channel.findById(channel._id)
      .populate("createdBy", "username email")
      .populate("members", "username email");

    res.status(201).json(populatedChannel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/channels/:id
// @desc    Get a single channel
router.get("/:id", protect, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate("createdBy", "username email")
      .populate("members", "username email");

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    res.json(channel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/channels/:id/join
// @desc    Join a channel
router.post("/:id/join", protect, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (!channel.members.includes(req.user._id)) {
      channel.members.push(req.user._id);
      await channel.save();
    }

    const populatedChannel = await Channel.findById(channel._id)
      .populate("createdBy", "username email")
      .populate("members", "username email");

    res.json(populatedChannel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/channels/:id/leave
// @desc    Leave a channel
router.post("/:id/leave", protect, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    channel.members = channel.members.filter(
      (memberId) => memberId.toString() !== req.user._id.toString()
    );
    await channel.save();

    const populatedChannel = await Channel.findById(channel._id)
      .populate("createdBy", "username email")
      .populate("members", "username email");

    res.json(populatedChannel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/channels/:id/messages
// @desc    Get messages for a channel
router.get("/:id/messages", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ channel: req.params.id })
      .populate("sender", "username email avatar")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Message.countDocuments({ channel: req.params.id });

    res.json({
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/channels/search/:query
// @desc    Search channels by name or description
router.get("/search/:query", protect, async (req, res) => {
  try {
    const query = req.params.query;
    if (!query || query.length < 1) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const channels = await Channel.find({
      $and: [
        {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
          ],
        },
        {
          $or: [
            { isPrivate: false },
            { members: req.user._id },
            { createdBy: req.user._id },
          ],
        },
      ],
    })
      .populate("createdBy", "username email")
      .populate("members", "username email")
      .limit(10);

    res.json(channels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/channels/:id/invite
// @desc    Invite a user to a channel
router.post("/:id/invite", protect, async (req, res) => {
  try {
    const { userId } = req.body;
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check if requester is channel creator or admin
    if (channel.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only channel creator can invite members" });
    }

    // Check if user already in channel
    if (channel.members.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User is already a member of this channel" });
    }

    // Add user to members
    channel.members.push(userId);
    await channel.save();

    const populatedChannel = await Channel.findById(channel._id)
      .populate("createdBy", "username email")
      .populate("members", "username email");

    res.json(populatedChannel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/channels/:id
// @desc    Delete a channel (only creator can delete)
router.delete("/:id", protect, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check if requester is the channel creator
    if (channel.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only channel creator can delete this channel" });
    }

    // Delete all messages in the channel
    await Message.deleteMany({ channel: req.params.id });

    // Delete the channel
    await Channel.findByIdAndDelete(req.params.id);

    res.json({ message: "Channel deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
