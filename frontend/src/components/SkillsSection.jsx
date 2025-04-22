import { useState, useEffect, useContext } from "react";
import { fireApi } from "../utils/useFire";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import {
  Chip,
  TextField,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useParams } from "react-router-dom";
import ProfileContext from "../context/profileContext";

const SkillsSection = ({ userData, GetUserProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingSkill, setEditingSkill] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const params = useParams();
  const { username } = params;

  const { user } = useContext(ProfileContext);
  const isOwnProfile = user?.username === userData?.username;

  useEffect(() => {
    if (userData?.skills) {
      setSkills(userData.skills);
    }
  }, [userData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setImage(null);
    setImagePreview(null);
    setEditingSkill(null);
  };

  const handleAddSkill = async () => {
    if (!name.trim()) return;

    try {
      const res = await fireApi("/skills", "POST", {
        name,
        description,
        image,
      });
      toast.success(res?.message || "Skill added successfully");
      resetForm();
      GetUserProfile(username);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error(error.message || "Failed to add skill");
    }
  };

  const handleUpdateSkill = async () => {
    if (!name.trim() || !editingSkill) return;

    try {
      const res = await fireApi("/skills", "PUT", {
        skillId: editingSkill._id,
        name,
        description,
        image,
      });
      toast.success(res?.message || "Skill updated successfully");
      resetForm();
      GetUserProfile(username);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error updating skill:", error);
      toast.error(error.message || "Failed to update skill");
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      const res = await fireApi("/skills", "DELETE", { skillId });
      toast.success(res?.message || "Skill deleted successfully");
      GetUserProfile(username);
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast.error(error.message || "Failed to delete skill");
    }
  };

  const startEditing = (skill) => {
    setEditingSkill(skill);
    setName(skill.name);
    setDescription(skill.description || "");
    setImagePreview(skill.image ? `data:image/jpeg;base64,${skill.image}` : null);
    setImage(skill.image || null);
    setOpenDialog(true);
  };

  const handleSubmit = () => {
    if (editingSkill) {
      handleUpdateSkill();
    } else {
      handleAddSkill();
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Skills</h2>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        {userData?.isSkillsVerified === true ? (
          skills.filter((skill) => skill.isSkillVerified).length > 0 ? (
            skills
              .filter((skill) => skill.isSkillVerified) // Filter skills with isSkillVerified: true
              .map((skill, index) => (
                <Chip
                  key={index}
                  label={skill.name}
                  onDelete={isEditing ? () => handleDeleteSkill(skill._id) : null}
                  deleteIcon={<X size={16} />}
                  variant="outlined"
                  onClick={isEditing ? () => startEditing(skill) : null}
                  sx={{
                    cursor: isEditing ? "pointer" : "default",
                    "&:hover": {
                      backgroundColor: isEditing ? "action.hover" : "transparent",
                    },
                  }}
                />
              ))
          ) : (
            <p className="text-gray-500">No verified skills available</p>
          )
        ) : (
          <p className="text-yellow-500">
            Skills are visible only after verification. Please verify your
            certificate first.
          </p>
        )}
      </Box>

      {isEditing && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
            startIcon={<AddIcon />}
          >
            Add New Skill
          </Button>
        </Box>
      )}

      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          resetForm();
        }}
      >
        <DialogTitle>{editingSkill ? "Edit Skill" : "Add New Skill"}</DialogTitle>
        <DialogContent sx={{ width: "400px" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Skill Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              fullWidth
              label="Description (Optional)"
              variant="outlined"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="skill-image-upload"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="skill-image-upload">
              <Button variant="outlined" component="span">
                Upload Image
              </Button>
            </label>
            <p className="text-gray-500 -mt-3">
              Image should be uploaded for skill certification
            </p>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: "200px", marginTop: "10px" }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim()}
            variant="contained"
          >
            {editingSkill ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {isOwnProfile && (
        <Box sx={{ mt: 2 }}>
          {isEditing ? (
            <Button
              variant="contained"
              onClick={() => {
                setIsEditing(false);
                resetForm();
              }}
            >
              Done Editing
            </Button>
          ) : (
            <Button
              variant="outlined"
              onClick={() => setIsEditing(true)}
              startIcon={<AddIcon />}
            >
              Edit Skills
            </Button>
          )}
        </Box>
      )}
    </div>
  );
};

export default SkillsSection;