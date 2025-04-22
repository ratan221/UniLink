import { School } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { fireApi } from "../utils/useFire";
import toast from "react-hot-toast";
import ProfileContext from "../context/profileContext";
import { useParams } from "react-router-dom";

const EducationSection = ({ userData, GetUserProfile }) => {
  const { user } = useContext(ProfileContext);
  const isOwnProfile = user?.username === userData?.username;
  const { username } = useParams();
  const [isAdding, setIsAdding] = useState(false);
  const [educations, setEducations] = useState([]);
  const [formData, setFormData] = useState({
    school: "",
    fieldOfStudy: "",
    startYear: "",
    endYear: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (userData?.education) {
      setEducations(userData.education);
    }
  }, [userData]);

  const resetForm = () => {
    setFormData({
      school: "",
      fieldOfStudy: "",
      startYear: "",
      endYear: "",
    });
  };

  const handleAddEducation = async () => {
    try {
      const res = await fireApi("/add-education", "POST", formData);
      toast.success(res?.message || "Education added successfully");
      setIsAdding(false);
      resetForm();
      GetUserProfile(username);
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to add education");
    }
  };

  const handleUpdateEducation = async () => {
    try {
      const res = await fireApi("/update-education", "PUT", {
        eduId: editingId,
        ...formData,
      });
      toast.success(res?.message || "Education updated successfully");
      setEditingId(null);
      resetForm();
      GetUserProfile(username);
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to update education");
    }
  };

  // const handleDeleteEducation = async (id) => {
  //   try {
  //     const res = await fireApi(`/delete-education/${id}`, "DELETE");
  //     toast.success(res?.message || "Education deleted successfully");
  //     GetUserProfile();
  //   } catch (error) {
  //     console.log(error);
  //     toast.error(error.message || "Failed to delete education");
  //   }
  // };

  const handleEditEducation = (edu) => {
    setEditingId(edu._id);
    setFormData({
      school: edu.school,
      fieldOfStudy: edu.fieldOfStudy,
      startYear: edu.startYear,
      endYear: edu.endYear || "",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    resetForm();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Education</h2>

      {educations.length === 0 && !isAdding && !editingId && isOwnProfile && (
        <div className="text-start py-4">
          <p className="text-gray-500 mb-4">No education added yet</p>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300"
          >
            Add Education
          </button>
        </div>
      )}

      {educations.map((edu) => (
        <div key={edu._id} className="mb-4 flex justify-between items-start">
          <div className="flex items-start">
            <School size={20} className="mr-2 mt-1" />
            <div>
              <h3 className="font-semibold">{edu.fieldOfStudy}</h3>
              <p className="text-gray-600">{edu.school}</p>
              <p className="text-gray-500 text-sm">
                {edu.startYear} - {edu.endYear || "Present"}
              </p>
            </div>
          </div>
          {isOwnProfile && !editingId && (
            <div className="flex gap-2">
              <button
                onClick={() => handleEditEducation(edu)}
                className="text-primary hover:text-primary-dark"
              >
                Edit Education
              </button>
              {/* <button 
                onClick={() => handleDeleteEducation(edu._id)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={20} />
              </button> */}
            </div>
          )}
        </div>
      ))}

      {(isAdding || editingId) && (
        <div className="mt-4 border-t pt-4">
          <h3 className="font-semibold mb-2">
            {editingId ? "Edit Education" : "Add New Education"}
          </h3>
          <input
            type="text"
            placeholder="School*"
            value={formData.school}
            onChange={(e) =>
              setFormData({ ...formData, school: e.target.value })
            }
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="text"
            placeholder="Field of Study*"
            value={formData.fieldOfStudy}
            onChange={(e) =>
              setFormData({ ...formData, fieldOfStudy: e.target.value })
            }
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="number"
            placeholder="Start Year*"
            value={formData.startYear}
            onChange={(e) =>
              setFormData({ ...formData, startYear: e.target.value })
            }
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="number"
            placeholder="End Year (leave blank if current)"
            value={formData.endYear}
            onChange={(e) =>
              setFormData({ ...formData, endYear: e.target.value })
            }
            className="w-full p-2 border rounded mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={editingId ? handleUpdateEducation : handleAddEducation}
              className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300"
            >
              {editingId ? "Update Education" : "Add Education"}
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

      {isOwnProfile && educations.length > 0 && !isAdding && !editingId && (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-4 bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300"
        >
          Add New Education
        </button>
      )}
    </div>
  );
};

export default EducationSection;
