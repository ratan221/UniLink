import { useState } from "react";
import { Pencil } from "lucide-react"; // Import Pencil Icon

const AboutSection = ({ userData, isOwnProfile, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [about, setAbout] = useState(userData.about || "");

  const handleSave = () => {
    setIsEditing(false);
    onSave({ about });
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 mb-6 border border-gray-200 relative">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center justify-between">
        About
        {isOwnProfile && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-500 hover:text-blue-600 transition"
          >
            <Pencil size={20} className="text-gray-600 hover:text-blue-600 transition" />
          </button>
        )}
      </h2>

      {isEditing ? (
        <>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className="w-full p-3 border bg-white border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition"
            >
              Save
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-700 text-lg">{userData.about || "No details provided yet."}</p>
      )}
    </div>
  );
};

export default AboutSection;
