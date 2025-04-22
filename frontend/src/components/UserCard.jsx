import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { fireApi } from "../utils/useFire";
import React, { useContext, useEffect } from "react";
import ProfileContext from "../context/profileContext";

function UserCard({ userDetails, getSugestion }) {
  const { user, GetUserProfile } = useContext(ProfileContext);
  const [isConnected, setIsConnected] = React.useState(false);
  useEffect(() => {
    console.log("User from context:", user);
  }, [user]);

  const HandleConnect = async () => {
    setIsConnected(false);
    try {
      const response = await fireApi(
        `/connections/request/${userDetails._id}`,
        "POST"
      );
      console.log(response);
      setIsConnected(true);
      toast.success(response.message || "Connected successfully");
      GetUserProfile(userDetails?.username);
      getSugestion();
    } catch (error) {
      console.error("Error in handleConnect:", error);
      toast.error(error.message || "Failed to connect");
      setIsConnected(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center transition-all hover:shadow-md">
      <Link
        to={`/profile/${userDetails.username}`}
        className="flex flex-col items-center"
      >
        <img
          src={userDetails.profilePicture || "/avatar.png"}
          alt={userDetails.name}
          className="w-24 h-24 rounded-full object-cover mb-4"
        />
        <h3 className="font-semibold text-lg text-center">
          {userDetails.name}
        </h3>
      </Link>
      <p className="text-gray-600 text-center">{userDetails.headline}</p>
      <button
        className={`mt-4  bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors w-full ${userDetails?.status === "pending" ? "bg-gray-400 cursor-not-allowed" : ""}`}
        onClick={HandleConnect}
      >
        {/* {isConnected ? "Pending" : "Connect"} */}
        {userDetails?.status === "pending" ? "Pending" : 
        userDetails?.status === "not_connected" ? "Connect" : "Connect"} 
      </button>
    </div>
  );
}

export default UserCard;
