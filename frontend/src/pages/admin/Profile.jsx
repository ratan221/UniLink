import { useState, useContext, useEffect, useRef } from "react";
import { Avatar, Button, Modal, Box, TextField, IconButton, Tooltip, Paper, Divider } from "@mui/material";
import { Camera, Upload, X } from "lucide-react";
import ProfileContext from "../../context/profileContext";
import { fireApi } from "../../utils/useFire";
import toast from "react-hot-toast";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

const Profile = () => {
  const { user, updateProfile } = useContext(ProfileContext);
  const [open, setOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    headline: user?.headline || '',
    location: user?.location || '',
    about: user?.about || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        headline: user.headline || '',
        location: user.location || '',
        about: user.about || '',
      });
      setPreviewImage(user.profilePicture || null);
    }
  }, [user]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setPreviewImage(user?.profilePicture || null);
    setSelectedFile(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const clearImage = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      
      // Append the file if selected
      if (selectedFile) {
        data.append('profilePicture', selectedFile);
      }

      const response = await fireApi("/update-profile", "PUT", data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success("Profile updated successfully!");
      console.log(response);
      window.location.reload(); // Reload the page to reflect changes
      // updateProfile(response.data); 
      handleClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    }
  };

  return (
    <>
      <Paper elevation={2} className="p-6 mb-6">
        <h1 className="text-2xl font-semibold mb-6">My Profile</h1>
        
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="relative">
            <Avatar 
              alt={user?.name} 
              src={user?.profilePicture} 
              sx={{ width: 120, height: 120 }}
            />
            <IconButton 
              color="primary"
              onClick={handleOpen}
              size="small"
              sx={{ 
                position: 'absolute', 
                bottom: 0, 
                right: 0, 
                backgroundColor: '#f0f9ff',
                border: '2px solid white',
                '&:hover': { backgroundColor: '#e0f2fe' }
              }}
            >
              <Camera size={20} />
            </IconButton>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-blue-600 font-medium">{user?.headline}</p>
            <p className="text-gray-600 flex items-center justify-center md:justify-start gap-1 mt-1">
              <span>{user?.location}</span>
            </p>
            <p className="text-gray-500 mt-1">{user?.email}</p>
            
            {user?.about && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">About</h3>
                <p className="text-gray-700">{user?.about}</p>
              </div>
            )}
            
            <Button 
              variant="contained" 
              sx={{ mt: 4 }}
              onClick={handleOpen}
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </Paper>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="edit-profile-modal"
      >
        <Box sx={style}>
          <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
          <Divider sx={{ mb: 3 }}/>
          
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Avatar 
                alt={formData.name} 
                src={previewImage}
                sx={{ width: 100, height: 100 }}
              />
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              
              <div className="absolute bottom-0 right-0 flex">
                <Tooltip title="Upload picture">
                  <IconButton 
                    onClick={triggerFileInput}
                    size="small"
                    sx={{ 
                      backgroundColor: '#2196f3',
                      color: 'white',
                      '&:hover': { backgroundColor: '#1976d2' }
                    }}
                  >
                    <Upload size={16} />
                  </IconButton>
                </Tooltip>
                
                {previewImage && (
                  <Tooltip title="Remove picture">
                    <IconButton 
                      onClick={clearImage}
                      size="small"
                      sx={{ 
                        backgroundColor: '#ef4444',
                        color: 'white',
                        ml: 1,
                        '&:hover': { backgroundColor: '#dc2626' }
                      }}
                    >
                      <X size={16} />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Headline"
              name="headline"
              placeholder="Your professional headline"
              value={formData.headline}
              onChange={handleChange}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Location"
              name="location"
              placeholder="City, Country"
              value={formData.location}
              onChange={handleChange}
              variant="outlined"
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="About"
              name="about"
              placeholder="Tell us about yourself"
              value={formData.about}
              onChange={handleChange}
              variant="outlined"
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outlined" 
                onClick={handleClose}
                sx={{ borderRadius: '8px' }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                sx={{ borderRadius: '8px' }}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default Profile;