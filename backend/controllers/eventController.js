import Event from "../models/eventModel.js";
import Notification from "../models/notification.model.js";
import cloudinary from "../lib/cloudinary.js"; // ✅ Use Cloudinary if needed

// ✅ Get All Events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "name username");
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Create an Event (Only "admin" or "head" users allowed)

export const createEvent = async (req, res) => {
  try {
    const { title, description, image, date, location } = req.body;

    // ✅ Remove role restrictions; allow all users to create events
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let imageUrl = "";
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newEvent = new Event({
      title,
      description,
      image: imageUrl,
      date,
      location,
      createdBy: req.user._id,
      createdByRole: req.user.role || "student", // Default to "student" if no role is assigned
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const updateEvent = async (req, res) => {
  try {
    const { title, description, image, date, location } = req.body;
    const { eventId } = req.params;
    console.log({ eventId });

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // ✅ Only the event creator or admin can update the event
    if (
      event.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this event" });
    }

    let imageUrl = event.image; // Keep old image if no new image is provided
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        title,
        description,
        image: imageUrl,
        date,
        location,
      },
      { new: true }
    );

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete an Event
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // ✅ Only allow admin or event creator to delete
    if (
      req.user.role !== "admin" &&
      event.createdBy.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this event" });
    }

    await Event.findByIdAndDelete(eventId);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const likeEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user._id;
    // console.log;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.likes.includes(userId)) {
      // Unlike event
      event.likes = event.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Like event
      event.likes.push(userId);

      // ✅ Create notification if user is not the event creator
      if (event.createdBy.toString() !== userId.toString()) {
        const newNotification = new Notification({
          recipient: event.createdBy,
          type: "event_like",
          relatedUser: userId,
          relatedEvent: eventId,
        });

        await newNotification.save();
      }
    }

    await event.save();
    res.status(200).json(event);
  } catch (error) {
    console.error("Error liking event:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createEventComment = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { content } = req.body;

    const event = await Event.findByIdAndUpdate(
      eventId,
      { $push: { comments: { user: req.user._id, content } } },
      { new: true }
    ).populate("comments.user", "name profilePicture");

    if (!event) return res.status(404).json({ message: "Event not found" });

    // ✅ Send notification if comment author is not the event creator
    if (event.createdBy.toString() !== req.user._id.toString()) {
      const newNotification = new Notification({
        recipient: event.createdBy,
        type: "event_comment",
        relatedUser: req.user._id,
        relatedEvent: eventId,
      });

      await newNotification.save();
    }

    res.status(200).json(event);
  } catch (error) {
    console.error("Error commenting on event:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateEventComment = async (req, res) => {
  try {
    const { eventId, commentId } = req.params;
    const { content } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const comment = event.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    comment.content = content;
    await event.save();

    res.status(200).json({ message: "Comment updated successfully", event });
  } catch (error) {
    console.error("Error updating event comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const shareEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    // ✅ Find Original Event
    const originalEvent = await Event.findById(eventId);
    if (!originalEvent)
      return res.status(404).json({ message: "Original event not found" });

    // ✅ Create New Shared Event
    const sharedEvent = new Event({
      title: originalEvent.title,
      description: content || originalEvent.description,
      image: originalEvent.image,
      date: originalEvent.date,
      location: originalEvent.location,
      createdBy: userId,
      createdByRole: req.user.role || "student",
      sharedEvent: eventId, // ✅ Store reference to original event
    });

    await sharedEvent.save();

    // ✅ Update Original Event (Track Shares)
    await Event.findByIdAndUpdate(eventId, {
      $push: { shares: userId }, // Store user who shared
    });

    res.status(201).json({ message: "Event shared successfully", sharedEvent });
  } catch (error) {
    console.error("Error sharing event:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// export const shareEvent = async (req, res) => {
//   try {
//     const { eventId } = req.params;
//     const userId = req.user._id;
//     const { content } = req.body;

//     const originalEvent = await Event.findById(eventId);
//     if (!originalEvent)
//       return res.status(404).json({ message: "Original event not found" });

//     const sharedEvent = new Event({
//       title: originalEvent.title,
//       description: content || originalEvent.description,
//       image: originalEvent.image,
//       date: originalEvent.date,
//       location: originalEvent.location,
//       createdBy: userId,
//       createdByRole: req.user.role || "student",
//       sharedEvent: eventId,
//     });

//     await sharedEvent.save();

//     res.status(201).json({ message: "Event shared successfully", sharedEvent });
//   } catch (error) {
//     console.error("Error sharing event:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
