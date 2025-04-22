import { Suspense, useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Loading from "../../utils/LoaderUtils";
import ProfileContext from "../../context/profileContext";

const AdminRoute = () => {
  const { user } = useContext(ProfileContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <Suspense fallback={<Loading processing />}>
      <Outlet />
    </Suspense>
  );
};

export default AdminRoute;