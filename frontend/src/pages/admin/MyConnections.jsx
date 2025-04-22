import toast from "react-hot-toast";
import { useContext, useEffect, useState } from "react";
import { fireApi } from "../../utils/useFire";
import Sidebar from "../../components/Sidebar";
import RecommendedUser from "../../components/RecommendedUser";
import ProfileContext from "../../context/profileContext";
import { Link } from "react-router-dom";

const MyConnections = () => {
  const [connections, setConnections] = useState(null);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [messageAccessId, setMessageAccesId] = useState(null);

  const { setShowUsersModal } = useContext(ProfileContext);
  const getConnections = async () => {
    try {
      const response = await fireApi("/connections", "POST");
      setConnections(response || null);
      console.log("Connections:", response);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getSugestion = async () => {
    try {
      const response = await fireApi("/suggestions", "GET");
      setRecommendedUsers(response);
    } catch (error) {
      console.error("Error in getSugestion:", error);
      toast.error(error.message || "Something went wrong!");
    }
  };

  useEffect(() => {
    getConnections();
    getSugestion();
  }, []);

  const GenerateMessageId = async (userId) => {
    try {
      if (!userId) {
        toast.error("User ID is required to generate message ID!");
        return null;
      }

      const res = await fireApi(`/api/chat/get-access`, "POST", { userId });

      if (res.ok) {
        localStorage.setItem("messageId", JSON.stringify(res?._id));
        setMessageAccesId(res?._id);
      }
      setShowUsersModal(true);
    } catch (error) {
      console.error("Error generating message ID:", error);
      toast.error(error.message || "Error generating message ID!");
      return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="col-span-1 lg:col-span-1">
        <Sidebar />
      </div>
      <div className="col-span-1 lg:col-span-2 order-first lg:order-none">
        <h1 className="text-2xl font-bold mb-6">All Connections</h1>

        {connections?.length > 0 ? (
          connections?.map((connection) => (
            <div
              key={connection?._id}
              className="flex bg-secondary rounded-lg items-center shadow justify-between p-4 mb-4"
            >
              <div className="flex items-center">
                <Link to={`/profile/${connection?.username}`}>
                  <img
                    src={connection?.profilePicture || "/avatar.png"}
                    alt={connection?.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                </Link>
                <div>
                  <Link to={`/profile/${connection?.username}`}>
                    <h2 className="font-semibold hover:underline hover:text-blue-500">{connection?.name}</h2>
                  </Link>
                  <p className="text-gray-500">{connection?.username}</p>
                  <p className="text-gray-400 text-xs">
                    {connection?.connections?.length} connections
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  GenerateMessageId(connection?._id);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 h-7 rounded"
              >
                Message
              </button>
            </div>
          ))
        ) : (
          <div className="bg-secondary rounded-lg shadow p-4 text-center">
            <h2 className="font-semibold mb-4">No Connections Found</h2>
            <p className="text-gray-500">You have no connections yet.</p>
          </div>
        )}
      </div>

      {recommendedUsers?.length > 0 && (
        <div className="col-span-1 lg:col-span-1 hidden lg:block">
          <div className="bg-secondary rounded-lg shadow p-4">
            <h2 className="font-semibold mb-4">People you may know</h2>
            {recommendedUsers?.map((user) => (
              <RecommendedUser key={user._id} user={user} getSugestion={getSugestion} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyConnections;
