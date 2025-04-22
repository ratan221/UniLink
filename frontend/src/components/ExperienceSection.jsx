import { Briefcase } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { formatDate } from "../utils/dateUtils";
import { fireApi } from "../utils/useFire";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import ProfileContext from "../context/profileContext";

const ExperienceSection = ({ userData, GetUserProfile }) => {
  const { user } = useContext(ProfileContext);
  const isOwnProfile = user?.username === userData?.username;

  const [isAdding, setIsAdding] = useState(false);
  const [experiences, setExperiences] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
    currentlyWorking: false,
  });
  const [editingId, setEditingId] = useState(null);
  const { username } = useParams();
  useEffect(() => {
    if (userData?.experience) {
      setExperiences(userData.experience);
    }
  }, [userData]);

  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      description: "",
      currentlyWorking: false,
    });
  };

  const handleAddExperience = async () => {
    if (!formData.title || !formData.company || !formData.startDate) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      const res = await fireApi("/add-experience", "POST", formData);
      toast.success(res?.message || "Experience added successfully");
      setIsAdding(false);
      resetForm();
      GetUserProfile(username);
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to add experience");
    }
  };

  const handleUpdateExperience = async () => {
    try {
      const res = await fireApi("/update-experience", "PUT", {
        expId: editingId,
        ...formData,
      });
      toast.success(res?.message || "Experience updated successfully");
      setEditingId(null);
      resetForm();
      GetUserProfile(username);
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to update experience");
    }
  };

  const handleCurrentlyWorkingChange = (e) => {
    setFormData({
      ...formData,
      currentlyWorking: e.target.checked,
      endDate: e.target.checked ? "" : formData.endDate,
    });
  };

  const handleEditExperience = (exp) => {
    setEditingId(exp._id);
    setFormData({
      title: exp.title,
      company: exp.company,
      startDate: exp.startDate,
      endDate: exp.endDate || "",
      description: exp.description,
      currentlyWorking: !exp.endDate,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    resetForm();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Experience</h2>

      {experiences.length === 0 && !isAdding && !editingId && isOwnProfile && (
        <div className="text-start py-4">
          <p className="text-gray-500 mb-4">No experience added yet</p>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300"
          >
            Add Experience
          </button>
        </div>
      )}

      {experiences.map((exp) => (
        <div key={exp._id} className="mb-4 flex justify-between items-start">
          <div className="flex items-start">
            <Briefcase size={20} className="mr-2 mt-1" />
            <div>
              <h3 className="font-semibold">{exp.title}</h3>
              <p className="text-gray-600">{exp.company}</p>
              <p className="text-gray-500 text-sm">
                {formatDate(exp.startDate)} -{" "}
                {exp.endDate ? formatDate(exp.endDate) : "Present"}
              </p>
              <p className="text-gray-700">{exp.description}</p>
            </div>
          </div>
          {isOwnProfile && !editingId && (
            <button
              onClick={() => handleEditExperience(exp)}
              className="text-primary hover:text-primary-dark"
            >
              Edit
            </button>
          )}
        </div>
      ))}

      {isOwnProfile && (isAdding || editingId) && (
        <div className="mt-4 border-t pt-4">
          <h3 className="font-semibold mb-2">
            {editingId ? "Edit Experience" : "Add New Experience"}
          </h3>

          <input
            type="text"
            placeholder="Title*"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="text"
            placeholder="Company*"
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="date"
            placeholder="Start Date*"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            className="w-full p-2 border rounded mb-2"
            required
          />
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="currentlyWorking"
              checked={formData.currentlyWorking}
              onChange={handleCurrentlyWorkingChange}
              className="mr-2"
            />
            <label htmlFor="currentlyWorking">I currently work here</label>
          </div>
          {!formData.currentlyWorking && (
            <input
              type="date"
              placeholder="End Date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
          )}
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full p-2 border rounded mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={editingId ? handleUpdateExperience : handleAddExperience}
              className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300"
            >
              {editingId ? "Update Experience" : "Add Experience"}
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isOwnProfile ? (
        !isAdding && !editingId ? (
          experiences.length > 0 ? (
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300"
            >
              Add New Experience
            </button>
          ) : null
        ) : null
      ) : null}
    </div>
  );
};

export default ExperienceSection;
