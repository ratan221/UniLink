import { Avatar, Menu, MenuItem, CssBaseline } from "@mui/material";
import { Link, Outlet, useNavigate } from "react-router-dom";
import ProfileContext from "../../context/profileContext";
import React, { Suspense, useContext } from "react";
import Loading from "../../utils/LoaderUtils";

const AdminLayout = () => {
  const { user } = useContext(ProfileContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("user-visited-dashboard");
    localStorage.removeItem("user-role");
    navigate("/login", { replace: true });
  }

  const handleNavigateProfile = () => {
    navigate("/admin/profile");
    handleClose();
  };


  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <CssBaseline />
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-5 hidden md:block flex-shrink-0">
        <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>
        <nav className="space-y-2">
          <Link to="/admin/home" className="block">
            <div className="py-2 px-3 hover:bg-blue-700 rounded cursor-pointer transition-colors">
              Home
            </div>
          </Link>
          <Link to="/admin/skills-approval" className="block">
            <div className="py-2 px-3 hover:bg-blue-700 rounded cursor-pointer transition-colors">
            Skills Approval
            </div>
          </Link>
          <Link to="/admin/certifications-approval" className="block">
            <div className="py-2 px-3 hover:bg-blue-700 rounded cursor-pointer transition-colors">
              Certifications Approval
            </div>
          </Link>
          <Link to="/admin/profile" className="block">
            <div className="py-2 px-3 hover:bg-blue-700 rounded cursor-pointer transition-colors">
              Profile
            </div>
          </Link>
            <div onClick={handleLogout} className="py-2 px-3 hover:bg-blue-700 rounded cursor-pointer transition-colors">
              Logout
            </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center ">
        <img src="/unilink-logo.png" alt="unilink" className="h-12" />
        <h1 className="text-lg font-semibold">Welcome, {user?.name || 'Admin'}</h1>
          <div className="flex items-center space-x-4">
            <Avatar
              alt={user?.name}
              src={user?.profilePicture}
              onClick={handleClick}
              className="cursor-pointer"
            />
            <button className="md:hidden bg-blue-900 text-white px-3 py-1 rounded text-sm">
              Menu
            </button>
          </div>
          
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem onClick={handleNavigateProfile}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </header>
          <hr/>
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="bg-white rounded-lg shadow-sm p-2 h-full">
            <Suspense fallback={<Loading />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;