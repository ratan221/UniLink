import { useContext, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { MapPin } from "lucide-react";
import { fireApi } from "../utils/useFire";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  IconButton,
  Avatar,
  Box,
  Divider,
} from "@mui/material";
import { CameraAlt, Close } from "@mui/icons-material";
import ProfileContext from "../context/profileContext";
import { Link, useParams } from "react-router-dom";

const ProfileHeader = ({ userData, GetUserProfile }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useContext(ProfileContext);
  const profilePicInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const isOwnProfile = user?.username === userData?.username;
  const { username } = useParams();

  const [formData, setFormData] = useState({
    bannerImg: userData?.bannerImg || "",
    profilePicture: userData?.profilePicture || "",
    name: userData?.name || "",
    username: userData?.username || "",
    headline: userData?.headline || "",
    about: userData?.about || "",
    location: userData?.location || "",
  });

  const [preview, setPreview] = useState({
    profilePicture: userData?.profilePicture || "",
    bannerImg: userData?.bannerImg || ""
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(prev => ({
          ...prev,
          [event.target.name]: reader.result
        }));
      };
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, [event.target.name]: file }));
    }
    // updateProfile();
    event.target.value = ""; 
  };

  const removeImage = (type) => {
    setPreview(prev => ({ ...prev, [type]: "" }));
    setFormData(prev => ({ ...prev, [type]: "" }));
  };

  const updateProfile = async () => {
    try {
      const formDataToSend = new FormData();
      
      // Append text fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('username', formData.username);
      formDataToSend.append('headline', formData.headline);
      formDataToSend.append('about', formData.about);
      formDataToSend.append('location', formData.location);
      
      // Append files if they exist
      if (formData.profilePicture instanceof File) {
        formDataToSend.append('profilePicture', formData.profilePicture);
      }
      
      if (formData.bannerImg instanceof File) {
        formDataToSend.append('bannerImg', formData.bannerImg);
      }

      const response = await fireApi(
        "/update-profile", 
        "PUT", 
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(response?.message || "Profile updated successfully");
      GetUserProfile(username);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error in updateProfile:", error);
      toast.error(error.message || "Something went wrong!");
    }
  };

  const handleEditClick = () => {
    setFormData({
      bannerImg: userData?.bannerImg || "",
      profilePicture: userData?.profilePicture || "",
      name: userData?.name || "",
      username: userData?.username || "",
      headline: userData?.headline || "",
      about: userData?.about || "",
      location: userData?.location || "",
    });
    setPreview({
      profilePicture: userData?.profilePicture || "",
      bannerImg: userData?.bannerImg || ""
    });
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      {/* Banner with upload icon */}
      <div className="relative h-48 rounded-t-lg bg-cover bg-center"
        style={{ backgroundImage: `url('${preview.bannerImg || userData?.bannerImg || "/banner.png"}')` }}>
        
        {isOwnProfile && (
          <div className="absolute top-2 right-2">
            <IconButton 
              onClick={() => bannerInputRef.current.click()}
              sx={{ backgroundColor: 'white', '&:hover': { backgroundColor: 'white' } }}
            >
              <CameraAlt />
            </IconButton>
            <input
              type="file"
              ref={bannerInputRef}
              style={{ display: "none" }}
              name="bannerImg"
              onChange={handleImageChange}
              accept="image/*"
            />
          </div>
        )}
      </div>

      {/* Profile picture with upload icon */}
      <div className="p-4">
        <div className="relative -mt-20 mb-4">
          <div className="relative w-32 h-32 rounded-full mx-auto overflow-hidden border-4 border-white">
            <img
              className="w-full h-full object-cover"
              src={preview.profilePicture || userData?.profilePicture || "/avatar.png"}
              alt={userData?.name}
            />
            {isOwnProfile && (
              <>
                <div 
                  className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center cursor-pointer transition-all duration-300"
                  onClick={() => profilePicInputRef.current.click()}
                >
                  <CameraAlt sx={{ color: 'white', fontSize: 30, opacity: 0, transition: 'opacity 0.3s' }} className="hover:opacity-100" />
                </div>
                <input
                  type="file"
                  ref={profilePicInputRef}
                  style={{ display: "none" }}
                  name="profilePicture"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </>
            )}
          </div>
        </div>

        {/* User info display */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold mb-2">{userData?.name}</h1>
          <h1 className="text-gray-600">username: {userData?.username}</h1>
          <p className="text-gray-600">Headline: {userData?.headline}</p>
          <div className="flex justify-center items-center mt-2">
            <MapPin size={16} className="text-gray-500 mr-1" />
            <span className="text-gray-600">Location: {userData?.location}</span>
          </div>
          <Link to={`/all-connections`}>
          <p className="text-blue-500 underline hover:cursor-pointer">View  Connections</p>
          </Link>
        </div>

        {isOwnProfile && (
          <button
            onClick={handleEditClick}
            className="w-full bg-primary text-white py-2 px-4 rounded-full hover:bg-primary-dark transition duration-300"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Edit Profile
          <IconButton onClick={() => setIsModalOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Banner Image with preview and delete */}
            <Box sx={{ mb: 2 }}>
              <label htmlFor="bannerImg">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<CameraAlt />}
                >
                  Upload Banner Image
                </Button>
                <input
                  accept="image/*"
                  id="bannerImg"
                  type="file"
                  style={{ display: "none" }}
                  name="bannerImg"
                  onChange={handleImageChange}
                />
              </label>
              
              {preview.bannerImg && (
                <Box sx={{ mt: 2, position: 'relative' }}>
                  <img 
                    src={preview.bannerImg} 
                    alt="Banner preview" 
                    style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px' }} 
                  />
                  <IconButton
                    onClick={() => removeImage('bannerImg')}
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>

            {/* Profile Picture with preview and delete */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2, flexDirection: 'column', alignItems: 'center' }}>
              <label htmlFor="profilePicture">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CameraAlt />}
                >
                  Upload Profile Picture
                </Button>
                <input
                  accept="image/*"
                  id="profilePicture"
                  type="file"
                  style={{ display: "none" }}
                  name="profilePicture"
                  onChange={handleImageChange}
                />
              </label>
              
              {preview.profilePicture && (
                <Box sx={{ mt: 2, position: 'relative', width: '100px', height: '100px' }}>
                  <Avatar
                    src={preview.profilePicture}
                    sx={{ width: '100%', height: '100%' }}
                  />
                  <IconButton
                    onClick={() => removeImage('profilePicture')}
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 0, 
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                      transform: 'translate(50%, -50%)'
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>

            {/* Other form fields */}
            <TextField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              variant="outlined"
            />

            <TextField
              label="Headline"
              name="headline"
              value={formData.headline}
              onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
              fullWidth
              variant="outlined"
            />

            <TextField
              label="Location"
              name="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              fullWidth
              variant="outlined"
            />

            <Divider sx={{ my: 2 }} />

            <TextField
              label="About"
              name="about"
              value={formData.about}
              onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
            />

            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={updateProfile}
                size="large"
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileHeader;