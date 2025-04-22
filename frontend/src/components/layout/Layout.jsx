import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useContext, useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { fireApi } from "../../utils/useFire";
import toast from "react-hot-toast";
import ProfileContext from "../../context/profileContext";

const Layout = () => {
  // getting my states from the context 
  const {showUsersModal, setShowUsersModal} = useContext(ProfileContext);

  const [selectedUser, setSelectedUser] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState(null);
  const [messageAccessId, setMessageAccesId] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [innerMessages, setInnerMessages] = useState([]); 

  const handleUserSelect = async (user, chat) => {
    setChatId(chat._id);
    setMessageAccesId(user?._id);
    setSelectedUser(user);
    setShowUsersModal(false);
    setChatOpen(true);
    await GetInnerChat(chat._id); 
  };

  const closeChat = () => {
    setChatOpen(false);
    setSelectedUser(null);
    setInnerMessages([]); // Clear messages when chat is closed
  };

  const decodeToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded;
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  };

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
    } catch (error) {
      console.error("Error generating message ID:", error);
      toast.error(error.message || "Error generating message ID!");
      return null;
    }
  };

  const GetAllParticipants = async () => {
    try {
      setLoading(true);
      const res = await fireApi(`/api/chat/get-messages`, "GET");

      // Process the chats to get unique participants and preserve chat information
      const processedChats = res.map((chat) => {
        // Find the other participant (excluding current user)
        const otherParticipant = chat.participants.find(
          (p) => p._id !== userId
        );
        return {
          ...chat,
          otherParticipant: otherParticipant || chat.participants[0], // fallback to first participant
        };
      });

      setParticipants(processedChats);
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Error fetching participants!");
      setLoading(false);
    }
  };

  const GetInnerChat = async (chatId) => {
    try {
      setLoading(true);
      const res = await fireApi(`/api/message/${chatId}`, "GET");
      setInnerMessages(res || []);
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Error fetching messages!");
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("user-visited-dashboard");
    if (token) {
      const decoded = decodeToken(token);
      localStorage.setItem("userId", JSON.stringify(decoded?.userId));
      setUserId(decoded?.userId);
      GenerateMessageId(decoded?.userId);
    }
  }, []);

  useEffect(() => {
    if (showUsersModal) {
      GetAllParticipants();
    }
  }, [showUsersModal]);

  const SendMessage = async () => {
    try {
      if (!content.trim()) return;

      await fireApi("/api/message/send-message", "POST", {
        content,
        chatId: chatId,
        messageType: "text",
      });

      toast.success("Message sent successfully!");
      setContent("");
      await GetInnerChat(chatId); // Refresh messages after sending
      await GetAllParticipants(); // Refresh participants list
    } catch (error) {
      console.log(error);
      toast.error("Error sending message!");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      SendMessage();
    }
  };

  // Get the latest message for participant list
  const getLatestMessage = (chat) => {
    return chat.latestMessage || { content: "No messages yet" };
  };

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6 relative">
        <Outlet />

        {/* Floating Message Button */}
        <div
          className="bg-primary text-primary-content rounded-full w-14 h-14 shadow-lg p-4 flex items-center justify-center fixed right-4 bottom-4 z-50 cursor-pointer hover:bg-primary-focus transition-colors"
          onClick={() => setShowUsersModal(true)}
        >
          <MessageCircle size={24} />
        </div>

        {/* Users Modal */}
        {showUsersModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end p-4 md:pt-20">
            <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-md h-[80vh] flex flex-col">
              <div className="bg-primary text-primary-content p-3 rounded-t-lg flex justify-between items-center">
                <h3 className="font-semibold text-lg">Messages</h3>
                <button
                  onClick={() => setShowUsersModal(false)}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <span className="loading loading-spinner"></span>
                  </div>
                ) : participants.length > 0 ? (
                  participants.map((chat) => (
                    <div
                      key={chat._id}
                      className="p-2 border-b border-base-300 hover:bg-base-200 cursor-pointer flex items-center gap-3"
                      onClick={() =>
                        handleUserSelect(chat.otherParticipant, chat)
                      }
                    >
                      <div className="avatar">
                        <div className="w-10 rounded-full">
                          {chat.otherParticipant.profilePicture ? (
                            <img
                              src={chat.otherParticipant.profilePicture}
                              alt={chat.otherParticipant.name}
                            />
                          ) : (
                            <div className="bg-neutral text-neutral-content rounded-full w-10 h-10 flex items-center justify-center">
                              <span>
                                {chat.otherParticipant.name?.charAt(0) || "U"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">
                          {chat.otherParticipant.name}
                        </h4>
                        <p className="text-sm text-base-content opacity-70 truncate">
                          {getLatestMessage(chat).content}
                        </p>
                      </div>
                      {chat.unreadCount && chat.unreadCount[userId] > 0 && (
                        <span className="badge badge-primary">
                          {chat.unreadCount[userId]}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-base-content opacity-70">
                    No conversations found
                  </div>
                )}{" "}
              </div>
            </div>
          </div>
        )}

        {/* Chat Window */}
        {chatOpen && selectedUser && (
          <div className="fixed right-4 bottom-20 z-40 w-full max-w-md">
            <div className="bg-base-100 rounded-lg shadow-xl w-full h-[60vh] flex flex-col border border-base-300">
              <div className="bg-primary text-primary-content p-3 rounded-t-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      {selectedUser.profilePicture ? (
                        <img
                          src={selectedUser.profilePicture}
                          alt={selectedUser.name}
                        />
                      ) : (
                        <div className="bg-neutral text-neutral-content rounded-full w-8 h-8 flex items-center justify-center">
                          <span>{selectedUser.name?.charAt(0) || "U"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="font-semibold">{selectedUser.name}</h3>
                </div>
                <button
                  onClick={closeChat}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <span className="loading loading-spinner"></span>
                  </div>
                ) : innerMessages.length > 0 ? (
                  innerMessages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.sender._id === userId
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                          message.sender._id === userId
                            ? "bg-primary text-primary-content"
                            : "bg-base-200"
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-base-content opacity-70 py-10">
                    Start a new conversation with {selectedUser.name}
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-base-300">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="input input-bordered flex-1 input-sm"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={SendMessage}
                    disabled={!content.trim()}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Layout;
