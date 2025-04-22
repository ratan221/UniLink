import { formatDistanceToNow } from "date-fns";
import {
  Loader,
  MessageCircle,
  Send,
  Share2,
  ThumbsUp,
  Trash2,
  Edit2,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import PostAction from "./PostAction";
import toast from "react-hot-toast";
import { fireApi } from "../utils/useFire";
import ProfileContext from "../context/profileContext";
import { useContext } from "react";

const EventCard = ({ events, getEvents }) => {
  const {user} = useContext(ProfileContext);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(
    Array.isArray(events?.comments) ? events.comments : []
  );
  const isOwner = user?.username === events?.createdBy?.username;
  console.log(isOwner, "isOwner");
  console.log(user, "user");
  console.log(events, "events");
  const [isLiked, setIsLiked] = useState(
    events?.likes?.includes(events?.author?._id)
  );
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  console.log(events, "events");
  if (!events) {
    return null;
  }

  const handleAddComment = async (submitEvent, eventId) => {
    submitEvent.preventDefault();
    if (!eventId) {
      toast.error("Event ID is missing!");
      return;
    }

    try {
      setIsAddingComment(true);
      const res = await fireApi(`/api/events/${eventId}/comment`, "POST", {
        content: newComment,
      });
      setComments(Array.isArray(res) ? res : []);
      setNewComment("");
      setIsAddingComment(false);
      toast.success("Comment added successfully");
      getEvents();
    } catch (error) {
      console.log(error);
      setIsAddingComment(false);
      toast.error(error.message || "An error occurred");
    }
  };

  const handleLikePost = async (event) => {
    try {
      await fireApi(`/api/events/${event?._id}/like`, "POST");
      setIsLiked(!isLiked);
      getEvents();
    } catch (error) {
      console.log(error);
      toast.error(error.message || "An error occurred");
    }
  };

  const handleDeletePost = async (event) => {
    try {
      setIsDeletingPost(true);
      await fireApi(`/api/events/delete/${event?._id}`, "DELETE");
      setIsDeletingPost(false);
      toast.success("Post deleted successfully");
      getEvents();
    } catch (error) {
      console.log(error);
      setIsDeletingPost(false);
      toast.error(error.message || "An error occurred");
    }
  };

  const handleEditComment = async (eventId, commentId, updatedContent) => {
    try {
      const res = await fireApi(
        `/api/events/${eventId}/comment/${commentId}`,
        "PUT",
        { content: updatedContent }
      );
      toast.success(res?.message);
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId
            ? { ...comment, content: updatedContent }
            : comment
        )
      );
      setEditingCommentId(null);
      setEditedContent("");
      toast.success("Comment updated successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.message || "An error occurred");
    }
  };

  const handleEditClick = (comment) => {
    setEditingCommentId(comment._id);
    setEditedContent(comment.content);
  };

  const handleUpdateComment = (event) => {
    event.preventDefault();
    handleEditComment(events?._id, editingCommentId, editedContent);
  };

  const handleSharePost = async (events) => {
    try {
      const res = await fireApi(`/api/events/${events?._id}/share`, "POST");
      console.log(res);

      toast.success(res?.message || "Post shared successfully");
      getEvents();
    } catch (error) {
      console.log(error);
      toast.error(error.message || "An error occurred");
    }
  };

  return (
    <div className="bg-secondary rounded-lg shadow mb-4">
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start">
            <Link to={`/profile/${events?.createdBy?.username}/${events?._id}`}>
              <img
                src={events?.author?.profilePicture || "/avatar.png"}
                alt={events?.author?.name || "User"}
                className="size-10 rounded-full mr-3"
              />
            </Link>

            <div>
              <Link to={`/profile/${events?.createdBy?.username}/${events?._id}`}>
                <h3 className="font-semibold">
                  {events?.createdBy?.name || "Unknown User"}
                </h3>
              </Link>
              <p className="text-xs text-info">
                Location: {events?.location || ""}
              </p>
              <p className="text-xs text-info">
                {formatDistanceToNow(new Date(events?.createdAt), {
                  addSuffix: true,
                })}
              </p>

              <p className="flex gap-2 mt-3">
                {" "}
                Title:
                <h3 className="font-semibold">
                  {events?.title || "No Title Found"}
                </h3>
              </p>
              <p className="flex gap-2 mt-0">
                {" "}
                Description:
                <h3 className="font-semibold">
                  {events?.description || "No Title Found"}
                </h3>
              </p>
            </div>
          </div>
          {isOwner && (
            <button
              onClick={() => handleDeletePost(events)}
              className="text-red-500 hover:text-red-700"
            >
              {isDeletingPost ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}
            </button>
          )}
        </div>
        {events?.image && (
          <img
            src={events.image}
            alt="Post content"
            className="rounded-lg w-full mb-4"
          />
        )}

        <div className="flex justify-between text-info">
          <PostAction
            icon={
              <ThumbsUp
                size={18}
                className={isLiked ? "text-blue-500 fill-blue-300" : ""}
              />
            }
            text={`Like (${events?.likes?.length || 0})`}
            onClick={() => handleLikePost(events)}
          />

          <PostAction
            icon={<MessageCircle size={18} />}
            text={`Comment (${comments.length})`}
            onClick={() => setShowComments(!showComments)}
          />
          <PostAction
            icon={<Share2 size={18} />}
            text="Share"
            onClick={() => handleSharePost(events)}
          />
        </div>
      </div>

      {showComments && (
        <div className="px-4 pb-4">
          <div className="mb-4 max-h-60 overflow-y-auto">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="mb-2 bg-base-100 p-2 rounded flex items-start"
              >
                <img
                  src={comment.user.profilePicture || "/avatar.png"}
                  alt={comment.user.name}
                  className="w-8 h-8 rounded-full mr-2 flex-shrink-0"
                />
                <div className="flex-grow">
                  <div className="flex items-center mb-1">
                    <span className="font-semibold mr-2">
                      {comment.user.name}
                    </span>
                    <span className="text-xs text-info">
                      {formatDistanceToNow(new Date(comment.createdAt))}
                    </span>
                  </div>
                  {editingCommentId === comment._id ? (
                    <form
                      onSubmit={handleUpdateComment}
                      className="flex items-center"
                    >
                      <input
                        type="text"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="flex-grow p-2 rounded-l-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary border-blue-50 border-1"
                      />
                      <button
                        type="submit"
                        className="bg-primary text-white p-2 rounded-r-full hover:bg-primary-dark transition duration-300 border-blue-500 border-3"
                      >
                        Update
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p>{comment.content}</p>
                      <p className="text-xs text-info flex items-center gap-3">
                        <Edit2
                          size={14}
                          className="text-info cursor-pointer"
                          onClick={() => handleEditClick(comment)}
                        />
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => handleAddComment(e, events._id)}
            className="flex items-center"
          >
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-grow p-2 rounded-l-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <button
              type="submit"
              className="bg-primary text-white p-2 rounded-r-full hover:bg-primary-dark transition duration-300"
              disabled={isAddingComment}
            >
              {isAddingComment ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default EventCard;
