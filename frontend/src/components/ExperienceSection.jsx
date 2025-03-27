import { Briefcase, X, Pencil } from "lucide-react";
import { useState } from "react";
import { formatDate } from "../utils/dateUtils";

const ExperienceSection = ({ userData, isOwnProfile, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [experiences, setExperiences] = useState(userData.experience || []);
  const [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
    currentlyWorking: false,
  });

  const handleAddOrSave = () => {
    let updatedExperiences = [...experiences];

    // Check if user has entered a new experience
    if (newExperience.title && newExperience.company && newExperience.startDate) {
      updatedExperiences = [...updatedExperiences, newExperience];

      // Reset the input fields
      setNewExperience({
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        description: "",
        currentlyWorking: false,
      });
    }

    // Update the state & save to backend
    setExperiences(updatedExperiences);
    onSave({ experience: updatedExperiences });

    // Exit edit mode
    setIsEditing(false);
  };

  const handleDeleteExperience = (id) => {
    const updatedExperiences = experiences.filter((exp) => exp._id !== id);
    setExperiences(updatedExperiences);
    onSave({ experience: updatedExperiences });
  };

  const handleCurrentlyWorkingChange = (e) => {
    setNewExperience({
      ...newExperience,
      currentlyWorking: e.target.checked,
      endDate: e.target.checked ? "" : newExperience.endDate,
    });
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 mb-6 border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex justify-between items-center">
        Experience
        {isOwnProfile && !isEditing && (
          <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-blue-600 transition">
            <Pencil size={22} />
          </button>
        )}
      </h2>

      {experiences.map((exp) => (
        <div key={exp._id} className="mb-4 p-4 border border-gray-200 rounded-xl flex justify-between items-start shadow-sm">
          <div className="flex items-start">
            <Briefcase size={22} className="mr-3 mt-1 text-gray-700" />
            <div>
              <h3 className="font-semibold text-gray-900">{exp.title}</h3>
              <p className="text-gray-600">{exp.company}</p>
              <p className="text-gray-500 text-sm">
                {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : "Present"}
              </p>
              <p className="text-gray-700">{exp.description}</p>
            </div>
          </div>
          {isEditing && (
            <button onClick={() => handleDeleteExperience(exp._id)} className="text-red-500 hover:text-red-700 transition">
              <X size={22} />
            </button>
          )}
        </div>
      ))}

      {isEditing && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Title"
            value={newExperience.title}
            onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
            className="w-full p-3 border bg-white border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition mb-2"
          />
          <input
            type="text"
            placeholder="Company"
            value={newExperience.company}
            onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
            className="w-full p-3 border bg-white border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition mb-2"
          />
          <input
            type="date"
            value={newExperience.startDate}
            onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
            className="w-full p-3 border bg-white border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition mb-2"
          />
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="currentlyWorking"
              checked={newExperience.currentlyWorking}
              onChange={handleCurrentlyWorkingChange}
              className="mr-2"
            />
            <label htmlFor="currentlyWorking" className="text-gray-700">
              I currently work here
            </label>
          </div>
          {!newExperience.currentlyWorking && (
            <input
              type="date"
              value={newExperience.endDate}
              onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
              className="w-full p-3 border bg-white border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition mb-2"
            />
          )}
          <textarea
            placeholder="Description"
            value={newExperience.description}
            onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
            className="w-full p-3 border bg-white border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition mb-2"
            rows="4"
          />

          <div className="flex justify-end gap-3 mt-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddOrSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition"
            >
              {newExperience.title || newExperience.company || newExperience.startDate ? "Add Experience" : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceSection;
