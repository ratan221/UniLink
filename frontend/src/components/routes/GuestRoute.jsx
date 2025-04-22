import { Suspense } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Loading from "../../utils/LoaderUtils";

const GuestRoute = () => {
  const userVisitedDashboard = localStorage.getItem("user-visited-dashboard");

  if (userVisitedDashboard) {
    return <Navigate to="/" replace />;
  }

  return (
    <Suspense fallback={<Loading/>}>
      <Outlet />
    </Suspense>
  );
};

export default GuestRoute;