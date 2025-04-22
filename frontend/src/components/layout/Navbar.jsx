import { Link, useNavigate } from "react-router-dom";
import { Bell, Home, LogOut, SearchIcon, User, Users } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import ProfileContext from "../../context/profileContext";
import { fireApi } from "../../utils/useFire";

const Navbar = () => {
  const { user } = useContext(ProfileContext);
  const navigate = useNavigate();

  const [searchUsername, setSearchUsername] = useState("");
  const [getUserResult, setGetUserResult] = useState([]);
  const [searchStatus, setSearchStatus] = useState(""); // "found", "not-found", "idle"

  const logout = () => {
    localStorage.removeItem("user-visited-dashboard");
    navigate("/login");
  };

  const authUserVisited = useMemo(() => {
    return localStorage.getItem("user-visited-dashboard");
  }, []);

  const searchUser = async (username) => {
    if (!username.trim()) return;

    try {
      const search = await fireApi(`/search-users?q=${username}`, "POST");
      console.log(search, "search result");

      if (search && search.length > 0) {
        setGetUserResult(search); // Now storing array of users
        setSearchStatus("found");
      } else {
        setGetUserResult([]);
        setSearchStatus("not-found");
      }
    } catch (error) {
      setGetUserResult([]);
      setSearchStatus("not-found");
      console.error("Error in searchUser:", error);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchUsername.trim()) {
        searchUser(searchUsername);
      } else {
        setGetUserResult(null);
        setSearchStatus("");
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [searchUsername]);

  return (
    <nav className="bg-secondary shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <img
                className="h-12 rounded"
                src="/unilink-logo.png"
                alt="unilink"
              />
            </Link>

            <div className="relative hidden md:flex flex-col space-y-1 w-64">
              {/* Search Input Field */}
              <div className="flex items-center space-x-2 border border-gray-300 bg-gray-200 rounded-md text-[12px] pr-2">
                <input
                  placeholder="Search"
                  className="px-4 py-2 bg-transparent outline-none w-full"
                  type="text"
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                />

                {searchUsername ? (
                  <span
                    className="cursor-pointer text-gray-400 hover:text-gray-600"
                    onClick={() => {
                      setSearchUsername("");
                      setGetUserResult({});
                    }}
                  >
                    ❌
                  </span>
                ) : (
                  <SearchIcon
                    size={20}
                    className="text-blue-400 cursor-pointer"
                    onClick={() => searchUser(searchUsername)}
                  />
                )}
              </div>

              {/* Dropdown - Show only if user result has data */}
              {searchUsername && (
                <div className="absolute top-full mt-1 w-full bg-white shadow-lg border rounded-md z-10 max-h-60 overflow-y-auto text-sm">
                  {searchStatus === "found" && getUserResult.length > 0 ? (
                    getUserResult.map((user) => (
                      <Link
                        key={user._id}
                        to={`/profile/${user.username}`}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                        onClick={() => {
                          setSearchUsername("");
                          setGetUserResult([]);
                          setSearchStatus("");
                        }}
                      >
                        <img
                          src={user.profilePicture || "/avatar.png"}
                          alt="profile"
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="ml-2 flex flex-col justify-center">
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-gray-500">@{user.username}</p>
                          <p className="text-gray-400 text-xs">{user.email}</p>
                        </div>
                      </Link>
                    ))
                  ) : searchStatus === "not-found" ? (
                    <div className="px-4 py-2 text-gray-500">
                      No user found by this username
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-6">
            {authUserVisited ? (
              <>
                <Link
                  to={"/"}
                  className="text-neutral flex flex-col items-center"
                >
                  <Home size={20} />
                  <span className="text-xs hidden md:block">Home</span>
                </Link>
                <Link
                  to="/network"
                  className="text-neutral flex flex-col items-center relative"
                >
                  <Users size={20} />
                  <span className="text-xs hidden md:block">My Network</span>
                  {/* {unreadConnectionRequestsCount > 0 && (
										<span
											className='absolute -top-1 -right-1 md:right-4 bg-blue-500 text-white text-xs 
										rounded-full size-3 md:size-4 flex items-center justify-center'
										>
											{unreadConnectionRequestsCount}
										</span>
									)} */}
                </Link>
                <Link
                  to="/notifications"
                  className="text-neutral flex flex-col items-center relative"
                >
                  <Bell size={20} />
                  <span className="text-xs hidden md:block">Notifications</span>
                  {/* {unreadNotificationCount > 0 && (
										<span
											className='absolute -top-1 -right-1 md:right-4 bg-blue-500 text-white text-xs 
										rounded-full size-3 md:size-4 flex items-center justify-center'
										>
											{unreadNotificationCount}
										</span>
									)} */}
                </Link>
                <Link
                  to={`/profile/${user?.username}`}
                  className="text-neutral flex flex-col items-center"
                >
                  <User size={20} />
                  <span className="text-xs hidden md:block">Me</span>
                </Link>
                <button
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
                  onClick={() => logout()}
                >
                  <LogOut size={20} />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">
                  Sign In
                </Link>
                <Link to="/signup" className="btn btn-primary">
                  Join now
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
