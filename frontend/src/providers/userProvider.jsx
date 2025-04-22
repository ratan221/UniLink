import { useEffect, useState } from "react";
import { fireApi } from "../utils/useFire";
import ProfileContext from "../context/profileContext";

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const GetUserProfile = async () => {
    try {
      const response = await fireApi("/me", "GET");
      setUser(response);
    } catch (error) {
      console.error("Error in GetUserProfile:", error);
    }
  };

  useEffect(() => {
    GetUserProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ user, setUser, GetUserProfile, showUsersModal, setShowUsersModal }}>
      {children}
    </ProfileContext.Provider>
  )
};

export default UserProvider;