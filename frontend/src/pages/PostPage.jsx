import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Post from "../components/Post";
import { useEffect, useState } from "react";
import { fireApi } from "../utils/useFire";
import { toast } from "react-hot-toast";

const PostPage = () => {
  const { id } = useParams(); // Make sure this matches your route parameter
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fireApi(`/posts/${id}`, "GET");
      setPost(response);
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error(error.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="hidden lg:block lg:col-span-1">
          <Sidebar />
        </div>
        <div className="col-span-1 lg:col-span-3 flex justify-center items-center h-64">
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="hidden lg:block lg:col-span-1">
          <Sidebar />
        </div>
        <div className="col-span-1 lg:col-span-3 flex justify-center items-center h-64">
          <p>Post not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
      <div className='hidden lg:block lg:col-span-1'>
        <Sidebar/>
      </div>

      <div className='col-span-1 lg:col-span-3'>
        <Post post={post} />
      </div>
    </div>
  );
};

export default PostPage;