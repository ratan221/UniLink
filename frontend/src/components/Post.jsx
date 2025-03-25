import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { Loader, MessageCircle, Send, Share2, ThumbsUp, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import PostAction from "./PostAction";

const Post = ({ post }) => {
    const { postId } = useParams();
    const queryClient = useQueryClient();

    const { data: authUser } = useQuery({
        queryKey: ["authUser"],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get("/auth/me");
                return res.data;
            } catch (err) {
                return null;
            }
        },
    });

    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState(post.comments || []);
    const isOwner = authUser?._id === post.author._id;
    const isLiked = post.likes.includes(authUser?._id);

    const { mutate: deletePost, isPending: isDeletingPost } = useMutation({
        mutationFn: async () => axiosInstance.delete(`/posts/delete/${post._id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            toast.success("Post deleted successfully");
        },
        onError: (error) => toast.error(error.message),
    });

    const { mutate: createComment, isPending: isAddingComment } = useMutation({
        mutationFn: async (newComment) => axiosInstance.post(`/posts/${post._id}/comment`, { content: newComment }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            toast.success("Comment added successfully");
        },
        onError: (err) => toast.error(err.response.data.message || "Failed to add comment"),
    });

    const { mutate: likePost, isPending: isLikingPost } = useMutation({
        mutationFn: async () => axiosInstance.post(`/posts/${post._id}/like`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["post", postId] });
        },
    });

    const handleDeletePost = () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        deletePost();
    };

    const handleLikePost = () => {
        if (isLikingPost) return;
        likePost();
    };

    const handleAddComment = (e) => {
        e.preventDefault();
        if (newComment.trim()) {
            createComment(newComment);
            setNewComment("");
        }
    };

    return (
        <div className='bg-white shadow-lg rounded-xl p-6 mb-6'>
            <div className='flex items-start justify-between'>
                <div className='flex items-center space-x-4'>
                    <Link to={`/profile/${post?.author?.username}`}>
                        <img
                            src={post.author.profilePicture || "/avatar.png"}
                            alt={post.author.name}
                            className='w-12 h-12 rounded-full border border-gray-300 shadow-sm'
                        />
                    </Link>
                    <div>
                        <Link to={`/profile/${post?.author?.username}`}>
                            <h3 className='text-lg font-semibold text-gray-900'>{post.author.name}</h3>
                        </Link>
                        <p className='text-sm text-gray-500'>{post.author.headline}</p>
                        <p className='text-xs text-gray-400'>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
                    </div>
                </div>
                {isOwner && (
                    <button onClick={handleDeletePost} className='text-red-500 hover:text-red-700 transition'>
                        {isDeletingPost ? <Loader size={18} className='animate-spin' /> : <Trash2 size={18} />}
                    </button>
                )}
            </div>
            <p className='mt-4 text-gray-800 text-base'>{post.content}</p>
            {post.image && <img src={post.image} alt='Post content' className='rounded-lg w-full mt-4 ' />}
            <div className='flex justify-between items-center mt-4 text-gray-500 border-t pt-3'>
                <PostAction
                    icon={<ThumbsUp size={18} className={isLiked ? "text-blue-500 fill-blue-300" : ""} />}
                    text={`Like (${post.likes.length})`}
                    onClick={handleLikePost}
                />
                <PostAction
                    icon={<MessageCircle size={18} />}
                    text={`Comment (${comments.length})`}
                    onClick={() => setShowComments(!showComments)}
                />
                <PostAction icon={<Share2 size={18} />} text='Share' />
            </div>
            {showComments && (
                <div className='px-6 pb-6'>
                    <form onSubmit={handleAddComment} className='flex items-center'>
                        <input
                            type='text'
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder='Add a comment...'
                            className='flex-grow p-2 rounded-l-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                        <button
                            type='submit'
                            className='bg-blue-500 text-white p-2 rounded-r-full hover:bg-blue-600 transition duration-300'
                            disabled={isAddingComment}
                        >
                            {isAddingComment ? <Loader size={18} className='animate-spin' /> : <Send size={18} />}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
export default Post;