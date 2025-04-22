import { useParams } from "react-router-dom";
import ProfileHeader from "../components/ProfileHeader";
import AboutSection from "../components/AboutSection";
import ExperienceSection from "../components/ExperienceSection";
import EducationSection from "../components/EducationSection";
import SkillsSection from "../components/SkillsSection";
import { useEffect, useState } from "react";
import Certification from "../components/Certificate";
import { fireApi } from "../utils/useFire";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const [user, setUser] = useState([]);
  const { username } = useParams();
  const isOwnProfile = user?.username === username;

  const GetUserProfile = async (username) => {
    try {
      const response = await fireApi(`/${username}`, "GET");
      console.log("User Profile Response:", response);
      setUser(response);
    } catch (error) {
      console.error("Error in GetUserProfile:", error);
      toast.error(error.message || "Something went wrong!");
    }
  };

  useEffect(() => {
    console.log("User in ProfilePage:", username);
    GetUserProfile(username);
  }, [username]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <ProfileHeader
        userData={user}
        GetUserProfile={GetUserProfile}
        isOwnProfile={isOwnProfile}
      />
      <AboutSection
        userData={user}
        GetUserProfile={GetUserProfile}
        isOwnProfile={isOwnProfile}
      />
      <ExperienceSection
        userData={user}
        GetUserProfile={GetUserProfile}
        isOwnProfile={isOwnProfile}
      />
      <EducationSection
        userData={user}
        GetUserProfile={GetUserProfile}
        isOwnProfile={isOwnProfile}
      />
      <SkillsSection
        userData={user}
        GetUserProfile={GetUserProfile}
        isOwnProfile={isOwnProfile}
      />
        <Certification
          userData={user}
          GetUserProfile={GetUserProfile}
          isOwnProfile={isOwnProfile}
        />
    </div>
  );
};

export default ProfilePage;
