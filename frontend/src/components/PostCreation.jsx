import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Image, Loader } from "lucide-react";

const PostCreation = ({ user }) => {
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const queryClient = useQueryClient();

    const { mutate: createPostMutation, isPending } = useMutation({
        mutationFn: async (postData) => {
            const res = await axiosInstance.post("/posts/create", postData, {
                headers: { "Content-Type": "application/json" },
            });
            return res.data;
        },
        onSuccess: () => {
            resetForm();
            toast.success("Post created successfully");
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: (err) => {
            toast.error(err.response.data.message || "Failed to create post");
        },
    });

    const handlePostCreation = async () => {
        try {
            const postData = { content };
            if (image) postData.image = await readFileAsDataURL(image);
            createPostMutation(postData);
        } catch (error) {
            console.error("Error in handlePostCreation:", error);
        }
    };

    const resetForm = () => {
        setContent("");
        setImage(null);
        setImagePreview(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) {
            readFileAsDataURL(file).then(setImagePreview);
        } else {
            setImagePreview(null);
        }
    };

    const readFileAsDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
            <div className="flex items-start space-x-4">
                <img
                    src={user.profilePicture || "/avatar.png"}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                />
                <textarea
                    placeholder="What's on your mind?"
                    className="w-full p-3 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none min-h-[100px] text-gray-700"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>

            {imagePreview && (
                <div className="mt-4 relative">
                    <img src={imagePreview} alt="Selected" className="w-full h-auto rounded-lg shadow-sm" />
                </div>
            )}

            <div className="flex justify-between items-center mt-5">
                <label className="flex items-center text-blue-500 hover:text-blue-600 cursor-pointer transition-all">
                    <Image size={22} className="mr-2" />
                    <span className="text-sm font-medium">Add Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>

                <button
                    className="px-5 py-2 bg-blue-500 text-white rounded-full font-medium shadow-md hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                    onClick={handlePostCreation}
                    disabled={isPending || !content.trim()}
                >
                    {isPending ? <Loader className="w-5 h-5 animate-spin" /> : "Post"}
                </button>
            </div>
        </div>
    );
};

export default PostCreation;
