import { Suspense, useLayoutEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Loading from "../../utils/LoaderUtils";

const AuthRoute = () => {
  const navigate = useNavigate();
  const userVisitedDashboard = localStorage.getItem("user-visited-dashboard");
  const userRole = localStorage.getItem("user-role");

  // ✅ Always call hooks unconditionally
  useLayoutEffect(() => {
    if (userRole === "admin") {
      navigate("/admin/home", { replace: true });
    }
  }, [navigate, userRole]);

  // ✅ After hooks
  if (!userVisitedDashboard) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <Outlet />
    </Suspense>
  );
};

export default AuthRoute;
