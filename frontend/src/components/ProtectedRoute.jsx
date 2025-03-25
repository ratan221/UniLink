import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ authUser, children }) => {
	return authUser ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
