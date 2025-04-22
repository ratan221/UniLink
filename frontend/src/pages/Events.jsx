import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import { fireApi } from "../utils/useFire";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import EventCard from "../components/eventCard";
import RecommendedUser from "../components/RecommendedUser";

const Events = () => {
  const [events, setEvents] = useState([]);
    const [recommendedUsers, setRecommendedUsers] = useState([]);
  const getEvents = async () => {
    try {
      const response = await fireApi("/api/events/get-list", "GET");
      setEvents(response);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getSugestion = async () => {
        try {
            const response = await fireApi('/suggestions', 'GET');
            setRecommendedUsers(response);
        } catch (error) {
            console.error('Error in getSugestion:', error);
            toast.error(error.message || 'Something went wrong!');
        }
    };

  useEffect(() => {
    getEvents();
    getSugestion();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="col-span-1 lg:col-span-1">
        <Sidebar />
      </div>
      <div className="col-span-1 lg:col-span-2 order-first lg:order-none">
        <h1 className="text-2xl font-bold mb-6">All Events</h1>

        {events?.map((events) => (
          <EventCard key={events._id} events={events} getEvents={getEvents} />
        ))}

        {events?.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-6">
              <Users size={64} className="mx-auto text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              No Events Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Connect with others to start seeing posts in your feed!
            </p>
          </div>
        )}

          
      </div>
      {recommendedUsers?.length > 0 && (
                <div className="col-span-1 lg:col-span-1 hidden lg:block">
                  <div className="bg-secondary rounded-lg shadow p-4">
                    <h2 className="font-semibold mb-4">People you may know</h2>
                    {recommendedUsers?.map((user) => (
                      <RecommendedUser key={user._id} user={user} />
                    ))}
                  </div>
                </div>
              )}
    </div>
  );
};

export default Events;
