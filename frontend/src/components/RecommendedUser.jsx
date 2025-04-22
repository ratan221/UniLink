import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import React from "react";
import { fireApi } from "../utils/useFire";

const RecommendedUser = ({ user, getSugestion }) => {
  const [isConnected, setIsConnected] = React.useState(user.status);
  
  const HandleConnect = async () => {
    try {
      if (isConnected === "not_connected") {
        const response = await fireApi(
          `/connections/request/${user._id}`,
          "POST"
        );
        toast.success(response.message || "Connection request sent");
        getSugestion();
      } else if (isConnected === "received") {
        // This will now be handled by HandleAccept
        return;
      }
    } catch (error) {
      console.error("Error in handleConnect:", error);
      toast.error(error.message || "Failed to connect");
    }
  };

  // const HandleAccept = async () => {
  //   try {
  //     const response = await fireApi(
  //       `/connections/accept/${user._id}`,
  //       "PUT"
  //     );
  //     toast.success(response.message || "Connection accepted");
  //     getSugestion();
  //   } catch (error) {
  //     console.error("Error in acceptConnection:", error);
  //     toast.error(error.message || "Failed to accept connection");
  //   }
  // };

  // const HandleReject = async () => {
  //   try {
  //     const response = await fireApi(
  //       `/connections/reject/${user._id}`,
  //       "PUT"
  //     );
  //     toast.success(response.message || "Connection rejected");
  //     getSugestion();
  //   } catch (error) {
  //     console.error("Error in rejectConnection:", error);
  //     toast.error(error.message || "Failed to reject connection");
  //   }
  // };

  const handlerequests = async () => {
    try {
      const response = await fireApi(
        `/connections/requests`,
        "GET"
      );
      console.log(response, "requests response");
      // setIsConnected(response.status);
    } catch (error) {
      console.error("Error in handleRequests:", error);
      toast.error(error.message || "Failed to fetch requests");
    }
  }

  React.useEffect(() => {
    setIsConnected(user.status);
    handlerequests();
  }, [user.status]);

  return (
    <div className="flex items-center justify-between mb-4">
      <Link
        to={`/profile/${user.username}`}
        className="flex items-center flex-grow"
      >
        <img
          src={user.profilePicture || "/avatar.png"}
          alt={user.name}
          className="w-12 h-12 rounded-full mr-3"
        />
        <div>
          <h3 className="font-semibold text-sm">{user.name}</h3>
          <p className="text-xs text-info">{user.headline}</p>
        </div>
      </Link>
      {isConnected === "received" ? (
        <div className="flex gap-2">
          <Link to={'/network'} className="px-3 py-1 rounded-full text-sm text-green-600 border border-green-600 cursor-pointer">
          Accept Request
          </Link>
        </div>
      ) : (
        <button
          className={`px-3 py-1 rounded-full text-sm text-white cursor-pointer ${
            isConnected === "not_connected"
              ? "bg-[#0a66c2]"
              : isConnected === "pending"
              ? "bg-gray-300 text-black"
              : "bg-gray-500"
          }`}
          onClick={HandleConnect}
        >
          {isConnected === "not_connected"
            ? "Connect"
            : isConnected === "pending"
            ? "Pending"
            : "Connected"}
        </button>
      )}
    </div>
  );
};

export default RecommendedUser;