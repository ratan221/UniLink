import { toast } from "react-hot-toast";
import {
  ExternalLink,
  Eye,
  MessageSquare,
  ThumbsUp,
  UserPlus,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { formatDistanceToNow } from "date-fns";
import { fireApi } from "../utils/useFire";
import { useState, useEffect } from "react";
import Loading from "../utils/LoaderUtils";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const getNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fireApi("/api/notifications", "GET");
      setNotifications(response || []);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fireApi(`/api/notifications/${notificationId}/read`, "PUT");
      //   setNotifications(prev =>
      //     prev.map(notif =>
      //       notif._id === notificationId ? { ...notif, read: true } : notif
      //     )
      //   );
      toast.success("Notification marked as read");
      getNotifications();
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await fireApi(`/api/notifications/${notificationId}`, "DELETE");
      //   setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      toast.success("Notification deleted");
      getNotifications();
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getNotifications();
  }, []);

  const renderNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <ThumbsUp className="text-blue-500" />;
      case "comment":
        return <MessageSquare className="text-green-500" />;
      case "connectionAccepted":
        return <UserPlus className="text-purple-500" />;
      default:
        return null;
    }
  };

  const renderNotificationContent = (notification) => {
    switch (notification.type) {
      case "like":
        return (
          <span>
            <strong>{notification.relatedUser?.name}</strong> liked your post
          </span>
        );
      case "comment":
        return (
          <span>
            <Link
              to={`/profile/${notification.relatedUser?.username}`}
              className="font-bold"
            >
              {notification.relatedUser?.name}
            </Link>{" "}
            commented on your post
          </span>
        );
      case "connectionAccepted":
        return (
          <span>
            <Link
              to={`/profile/${notification.relatedUser?.username}`}
              className="font-bold"
            >
              {notification.relatedUser?.name}
            </Link>{" "}
            accepted your connection request
          </span>
        );
      default:
        return null;
    }
  };

  const NavigateSinglePost = (id) => {
    navigate(`/post/${id}`);
  };

  const renderRelatedPost = (relatedPost) => {
    if (!relatedPost) return null;
    // getNotifications();
    return (
      <div
		onClick={() => NavigateSinglePost(relatedPost?._id)}
        className="mt-2 p-2 bg-gray-50 rounded-md flex items-center space-x-2 hover:bg-gray-100 transition-colors cursor-pointer"
      >
        {relatedPost.image && (
          <img
            src={relatedPost.image}
            alt="Post preview"
            className="w-10 h-10 object-cover rounded"
          />
        )}
        <div className="flex-1 overflow-hidden">
          <p className="text-sm text-gray-600 truncate">
            {relatedPost.content ? relatedPost.content : "No Title"}
          </p>
        </div>
        <ExternalLink size={14} className="text-gray-400 cursor-pointer" />
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="col-span-1 lg:col-span-1">
        <Sidebar />
      </div>
      <div className="col-span-1 lg:col-span-3">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Notifications</h1>

          {isLoading ? (
            <div className="flex justify-center py-8">
              {/* <p>Loading notifications...</p> */}
              <Loading/>
            </div>
          ) : notifications.length > 0 ? (
            <ul>
              {notifications.map((notification) => (
                <li
                  key={notification._id}
                  className={`border rounded-lg p-4 my-4 transition-all hover:shadow-md ${
                    !notification.read
                      ? "bg-gray-50 opacity-90 border-blue-500"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Link
                        to={`/profile/${notification.relatedUser?.username}`}
                      >
                        <img
                          src={
                            notification.relatedUser?.profilePicture ||
                            "/avatar.png"
                          }
                          alt={notification.relatedUser?.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      </Link>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-gray-100 rounded-full">
                            {renderNotificationIcon(notification.type)}
                          </div>
                          <p className="text-sm">
                            {renderNotificationContent(notification)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                            }
                          )}
                        </p>
                        {renderRelatedPost(notification.relatedPost)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                          aria-label="Mark as read"
                        >
                          <Eye size={16} />
                        </button>
                      )}

                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                        aria-label="Delete notification"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex justify-center py-8">
              <p>No notifications at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
