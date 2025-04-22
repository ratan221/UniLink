import { Link } from "react-router-dom";
import { Home, UserPlus, Bell, Calendar, BadgeCheck } from "lucide-react";
import { useContext } from "react";
import ProfileContext from "../context/profileContext";

export default function Sidebar() {

  const { user } = useContext(ProfileContext);
  
  return (
    <div className="bg-secondary rounded-lg shadow">
      <div className="p-4 text-center">
        <div
          className="h-16 rounded-t-lg bg-cover bg-center"
          style={{
            backgroundImage: "url('/banner.png')",
          }}
        />
        <Link to={`/profile/${user?.username}`} className="block">
          <img
            src={user?.profilePicture || "/avatar.png"}
            alt={user?.name || "User"}
            className="w-20 h-20 rounded-full mx-auto mt-[-40px] border-4 border-white"
          />
          <h2 className="text-xl font-semibold mt-2 inline-flex items-center justify-center gap-1 mx-auto">
            {user?.name}
          </h2>
          {user?.isVerified === true && (
            <p className="justify-center flex text-gray-400">
              Account Verified
              <BadgeCheck className=" ml-2 w-5 h-5 text-blue-500" />
            </p>
          )}
        </Link>
        <p className="text-gray-600 mt-1">{user?.headline}</p>{" "}
        <p className="text-gray-500 text-xs mt-1">
          {" "}
          {user?.connections?.length || 0} connections
        </p>
        <Link to="/all-connections" >
        <p className="text-primary text-xs mt-1">View all connections</p>
        </Link>
      </div>
      <div className="border-t border-base-100 p-4">
        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className="flex items-center py-2 px-4 rounded-md hover:bg-primary hover:text-white transition-colors"
              >
                <Home className="mr-2" size={20} /> Home
              </Link>
            </li>
            <li>
              <Link
                to="/network"
                className="flex items-center py-2 px-4 rounded-md hover:bg-primary hover:text-white transition-colors"
              >
                <UserPlus className="mr-2" size={20} /> My Network
              </Link>
            </li>
            <li>
              <Link
                to="/events"
                className="flex items-center py-2 px-4 rounded-md hover:bg-primary hover:text-white transition-colors"
              >
                <Calendar className="mr-2" size={20} /> Events
              </Link>
            </li>
            <li>
              <Link
                to="/analytics"
                className="flex items-center py-2 px-4 rounded-md hover:bg-primary hover:text-white transition-colors"
              >
                <Calendar className="mr-2" size={20} /> Analytics
              </Link>
            </li>
            <li>
              <Link
                to="/notifications"
                className="flex items-center py-2 px-4 rounded-md hover:bg-primary hover:text-white transition-colors"
              >
                <Bell className="mr-2" size={20} /> Notifications
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-base-100 p-4">
        <Link
          to={`/profile/${user?.username}`}
          className="text-sm font-semibold"
        >
          Visit your profile
        </Link>
      </div>
    </div>
  );
}
