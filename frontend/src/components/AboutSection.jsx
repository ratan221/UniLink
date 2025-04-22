const AboutSection = ({ userData }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">About</h2>
      {userData?.about ? (
        <p>{userData?.about}</p>
      ) : (
        <p className="text-gray-500">No about information available</p>
      )}
    </div>
  );
};
export default AboutSection;
