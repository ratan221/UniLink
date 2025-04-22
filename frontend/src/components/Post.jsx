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
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import PostAction from "./PostAction";
import toast from "react-hot-toast";
import { fireApi } from "../utils/useFire";
import ProfileContext from "../context/profileContext";

const Post = ({ post, getPost }) => {
  const { user } = useContext(ProfileContext);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(
    Array.isArray(post?.comments) ? post.comments : []
  );
  const isOwner = user?.username === post?.author?.username;
  const [isLiked, setIsLiked] = useState(
    post?.likes?.includes(post?.author?._id)
  );
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState("");

  if (!post) {
    return null;
  }

  const handleAddComment = async (event) => {
    event.preventDefault();
    try {
      setIsAddingComment(true);
      const res = await fireApi(`/posts/${post?._id}/comment`, "POST", {
        content: newComment,
      });
      setComments(Array.isArray(res) ? res : []);
      setNewComment("");
      setIsAddingComment(false);
      toast.success("Comment added successfully");
      getPost();
    } catch (error) {
      console.log(error);
      setIsAddingComment(false);
      toast.error(error.message || "An error occurred");
    }
  };

  const handleLikePost = async () => {
    try {
      await fireApi(`/posts/${post?._id}/like`, "POST");
      setIsLiked(!isLiked);
      getPost();
    } catch (error) {
      console.log(error);
      toast.error(error.message || "An error occurred");
    }
  };

  const handleDeletePost = async () => {
    try {
      setIsDeletingPost(true);
      await fireApi(`/posts//delete/${post?._id}`, "DELETE");
      setIsDeletingPost(false);
      toast.success("Post deleted successfully");
      getPost();
    } catch (error) {
      console.log(error);
      setIsDeletingPost(false);
      toast.error(error.message || "An error occurred");
    }
  };

  const handleEditComment = async (commentId, updatedContent) => {
    try {
      const res = await fireApi(
        `/posts/${post?._id}/comments/${commentId}`,
        "PUT",
        { content: updatedContent }
      );
      toast.success(res?.message || "Comment updated successfully");
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
    handleEditComment(editingCommentId, editedContent);
  };

  const handleSharePost = (post) => async () => {
    try {
      const res = await fireApi(`/posts/${post?._id}/share`, "POST");
      console.log(res);

      toast.success(res?.message || "Post shared successfully");
      getPost();
    } catch (error) {
      console.log(error);
      toast.error(error.message || "An error occurred");
    }
  };

  return (
    <div className="bg-secondary rounded-lg shadow mb-4">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link to={`/profile/${post?.author?.username}`}>
              <img
                src={post?.author?.profilePicture || "/avatar.png"}
                alt={post?.author?.name || "User"}
                className="size-10 rounded-full mr-3"
              />
            </Link>

            <div>
              <Link to={`/profile/${post?.author?.username}`}>
                <h3 className="font-semibold">
                  {post?.author?.name || "Unknown User"}
                </h3>
              </Link>
              <p className="text-xs text-info">
                {post?.author?.headline || ""}
              </p>
              <p className="text-xs text-info">
                {formatDistanceToNow(new Date(post?.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
          {isOwner && (
            <button
              onClick={handleDeletePost}
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
        <p className="mb-4">{post?.content}</p>
        {post?.image && (
          <img
            src={post.image}
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
            text={`Like (${post?.likes?.length || 0})`}
            onClick={handleLikePost}
          />

          <PostAction
            icon={<MessageCircle size={18} />}
            text={`Comment (${comments.length})`}
            onClick={() => setShowComments(!showComments)}
          />
          <PostAction
            icon={<Share2 size={18} />}
            text="Share"
            onClick={handleSharePost(post)}
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
                        {isOwner && (
                          <Edit2
                            size={14}
                            className="text-info cursor-pointer"
                            onClick={() => handleEditClick(comment)}
                          />
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex items-center">
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

export default Post;
