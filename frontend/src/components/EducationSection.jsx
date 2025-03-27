import { School, X, Pencil } from "lucide-react";
import { useState } from "react";

const EducationSection = ({ userData, isOwnProfile, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [educations, setEducations] = useState(userData.education || []);
  const [newEducation, setNewEducation] = useState({
    school: "",
    fieldOfStudy: "",
    startYear: "",
    endYear: "",
  });

  const handleAddOrSave = () => {
    let updatedEducations = [...educations];

    if (newEducation.school && newEducation.fieldOfStudy && newEducation.startYear) {
      updatedEducations = [...updatedEducations, newEducation];
      setNewEducation({ school: "", fieldOfStudy: "", startYear: "", endYear: "" });
    }

    setEducations(updatedEducations);
    onSave({ education: updatedEducations });
    setIsEditing(false);
  };

  const handleDeleteEducation = (id) => {
    const updatedEducations = educations.filter((edu) => edu._id !== id);
    setEducations(updatedEducations);
    onSave({ education: updatedEducations });
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 mb-6 border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex justify-between items-center">
        Education
        {isOwnProfile && !isEditing && (
          <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-blue-600 transition">
            <Pencil size={22} />
          </button>
        )}
      </h2>

      {educations.map((edu) => (
        <div key={edu._id} className="mb-4 p-4 border border-gray-200 rounded-xl flex justify-between items-start shadow-sm">
          <div className="flex items-start">
            <School size={24} className="mr-3 text-gray-600" />
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{edu.fieldOfStudy}</h3>
              <p className="text-gray-700">{edu.school}</p>
              <p className="text-gray-500 text-sm">
                {edu.startYear} - {edu.endYear || "Present"}
              </p>
            </div>
          </div>
          {isEditing && (
            <button onClick={() => handleDeleteEducation(edu._id)} className="text-red-500 hover:text-red-700 transition">
              <X size={20} />
            </button>
          )}
        </div>
      ))}

      {isEditing && (
        <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-xl shadow-sm">
          <input
            type="text"
            placeholder="School"
            value={newEducation.school}
            onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white outline-none transition"
          />
          <input
            type="text"
            placeholder="Field of Study"
            value={newEducation.fieldOfStudy}
            onChange={(e) => setNewEducation({ ...newEducation, fieldOfStudy: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white outline-none transition"
          />
          <input
            type="number"
            placeholder="Start Year"
            value={newEducation.startYear}
            onChange={(e) => setNewEducation({ ...newEducation, startYear: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent  bg-white outline-none transition"
          />
          <input
            type="number"
            placeholder="End Year (optional)"
            value={newEducation.endYear}
            onChange={(e) => setNewEducation({ ...newEducation, endYear: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-whi bg-white outline-none transition"
          />
        </div>
      )}

      {isEditing && (
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition">
            Cancel
          </button>
          <button
            onClick={handleAddOrSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            {newEducation.school || newEducation.fieldOfStudy || newEducation.startYear ? "Add Education" : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
};

export default EducationSection;
