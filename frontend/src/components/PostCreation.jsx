import { useState } from "react";
import { CalendarDays, Image, Loader } from "lucide-react";
import { fireApi } from "../utils/useFire";
import toast from "react-hot-toast";
import CreateEvent from "./CreateEvent";

const PostCreation = ({ getPost }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Calculate if the form is valid
  const isFormValid = content.trim().length > 0 || image !== null;

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handlePostCreation = async () => {
    if (!isFormValid) return; // Extra safeguard
    
    try {
      setIsLoading(true);
      const postData = { content };
      if (image) postData.image = await readFileAsDataURL(image);

      const response = await fireApi("/posts/create", "POST", postData);
      console.log(response);

      resetForm();
      setIsLoading(false);
      toast.success(response.message || "Post created successfully");
      getPost();
    } catch (error) {
      console.error("Error in handlePostCreation:", error);
      toast.error(error.message || "Failed to create post");
    } finally {
      setIsLoading(false);
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
    <>      
      <div className="bg-secondary rounded-lg shadow mb-4 p-4">
        <div className="flex space-x-3">
          <img
            src={"/avatar.png"}
            alt={"user.name"}
            className="size-12 rounded-full"
          />
          <textarea
            placeholder="What's on your mind?"
            className="w-full p-3 rounded-lg bg-base-100 hover:bg-base-200 focus:bg-base-200 focus:outline-none resize-none transition-colors duration-200 min-h-[100px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {imagePreview && (
          <div className="mt-4">
            <img
              src={imagePreview}
              alt="Selected"
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-4">
            <label className="flex items-center text-info hover:text-info-dark transition-colors duration-200 cursor-pointer">
              <Image size={20} className="mr-2" />
              <span>Photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>

            <label className="flex items-center text-info hover:text-info-dark transition-colors duration-200 cursor-pointer"
            onClick={handleOpen}>
              <CalendarDays size={20} className="mx-2" />
              <span>Events</span>
            </label>
          </div>

          <button
            className={`rounded-lg px-4 py-2 transition-colors duration-200 ${
              isFormValid
                ? "bg-primary text-white hover:bg-primary-dark"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={handlePostCreation}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? <Loader className="size-5 animate-spin" /> : "Share"}
          </button>
        </div>
      </div>

      <CreateEvent open={open} handleClose={handleClose}/>
    </>
  );
};

export default PostCreation;