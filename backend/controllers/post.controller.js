import cloudinary from "../lib/cloudinary.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import { sendCommentNotificationEmail } from "../emails/emailHandlers.js";

export const getFeedPosts = async (req, res) => {
  console.log("hello sssssssssssssssssss");
  try {
    const posts = await Post.find({
      author: { $in: [...req.user.connections, req.user._id] },
    })
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getFeedPosts controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// export const getFeedPosts = async (req, res) => {
//   try {
//     if (!req.user) {
//       return res
//         .status(401)
//         .json({ message: "User not found in getFeedPosts" });
//     }

//     const posts = await Post.find({
//       author: { $in: [...(req.user.connections || []), req.user._id] }, // Handle undefined connections
//     })
//       .populate("author", "name username profilePicture headline")
//       .populate("comments.user", "name profilePicture")
//       .sort({ createdAt: -1 });

//     res.status(200).json(posts);
//   } catch (error) {
//     console.error("Error in getFeedPosts controller:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    const originalPost = await Post.findById(postId);
    if (!originalPost) {
      return res.status(404).json({ message: "Original post not found" });
    }

    const sharedPost = new Post({
      author: userId,
      sharedPost: postId,
      content: content || "",
      createdAt: new Date(),
    });

    await sharedPost.save();

    res.status(201).json({ message: "Post shared successfully", sharedPost });
  } catch (error) {
    console.error("❌ Error sharing post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    // console.log(image);
    let newPost;

    if (image) {
      const imgResult = await cloudinary.uploader.upload(image);
      newPost = new Post({
        author: req.user._id,
        content,
        image: imgResult.secure_url,
      });
    } else {
      newPost = new Post({
        author: req.user._id,
        content,
      });
    }

    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error in createPost controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // check if the current user is the author of the post
    if (post.author.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this post" });
    }

    // delete the image from cloudinary as well!
    if (post.image) {
      await cloudinary.uploader.destroy(
        post.image.split("/").pop().split(".")[0]
      );
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in delete post controller", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId)
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture username headline");

    res.status(200).json(post);
  } catch (error) {
    console.error("Error in getPostById controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    console.log("Received Comment:", content); // ✅ Log comment before saving

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { comments: { user: req.user._id, content } },
      },
      { new: true }
    ).populate("author", "name email username headline profilePicture");

    console.log("Updated Post Comments:", post.comments); // ✅ Log saved comments

    // create a notification if the comment owner is not the post owner
    if (post.author._id.toString() !== req.user._id.toString()) {
      const newNotification = new Notification({
        recipient: post.author,
        type: "comment",
        relatedUser: req.user._id,
        relatedPost: postId,
      });

      await newNotification.save();

      try {
        const postUrl = process.env.CLIENT_URL + "/post/" + postId;
        await sendCommentNotificationEmail(
          post.author.email,
          post.author.name,
          req.user.name,
          postUrl,
          content
        );
      } catch (error) {
        console.log("Error in sending comment notification email:", error);
      }
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error in createComment controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const updateComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Ensure only the comment owner can update
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    comment.content = content; // ✅ Update the content
    await post.save(); // ✅ Save changes

    res.status(200).json({ message: "Comment updated successfully", post });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    const userId = req.user._id;

    if (post.likes.includes(userId)) {
      // unlike the post
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // like the post
      post.likes.push(userId);
      // create a notification if the post owner is not the user who liked
      if (post.author.toString() !== userId.toString()) {
        const newNotification = new Notification({
          recipient: post.author,
          type: "like",
          relatedUser: userId,
          relatedPost: postId,
        });

        await newNotification.save();
      }
    }

    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.error("Error in likePost controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};
