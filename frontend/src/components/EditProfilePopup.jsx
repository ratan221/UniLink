import { useState } from "react";
import { Camera, X } from "lucide-react";

const EditProfilePopup = ({ userData, onSave, onClose }) => {
  const [editedData, setEditedData] = useState({
    name: userData.name || "",
    headline: userData.headline || "",
    location: userData.location || "",
    profilePicture: userData.profilePicture || "",
    bannerImg: userData.bannerImg || "",
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedData((prev) => ({
          ...prev,
          [event.target.name]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={22} className="text-gray-500" />
          </button>
        </div>

        {/* Banner Image */}
        <div className="relative h-36 rounded-xl bg-gray-200 mb-6 overflow-hidden">
          <img
            src={editedData.bannerImg || "/banner.png"}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <label className="absolute top-2 right-2 bg-gray-800 text-white p-2 rounded-full cursor-pointer hover:bg-gray-700 transition">
            <Camera size={20} />
            <input
              type="file"
              className="hidden"
              name="bannerImg"
              onChange={handleImageChange}
              accept="image/*"
            />
          </label>
        </div>

        {/* Profile Picture */}
        <div className="relative w-28 h-28 mx-auto mb-6">
          <img
            src={editedData.profilePicture || "/avatar.png"}
            alt="Profile"
            className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
          />
          <label className="absolute bottom-2 right-2 bg-gray-800 text-white p-2 rounded-full cursor-pointer hover:bg-gray-700 transition">
            <Camera size={18} />
            <input
              type="file"
              className="hidden"
              name="profilePicture"
              onChange={handleImageChange}
              accept="image/*"
            />
          </label>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={editedData.name}
              onChange={(e) => setEditedData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 bg-gray-100 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
            <input
              type="text"
              value={editedData.headline}
              onChange={(e) => setEditedData((prev) => ({ ...prev, headline: e.target.value }))}
              className="w-full p-3 bg-gray-100 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={editedData.location}
              onChange={(e) => setEditedData((prev) => ({ ...prev, location: e.target.value }))}
              className="w-full p-3 bg-gray-100 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editedData)}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePopup;
