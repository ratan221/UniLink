import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import toast, { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./lib/axios";
import NotificationsPage from "./pages/NotificationsPage";
import NetworkPage from "./pages/NetworkPage";
import PostPage from "./pages/PostPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
	const { data: authUser, isLoading } = useQuery({
		queryKey: ["authUser"],
		queryFn: async () => {
			try {
				const res = await axiosInstance.get("/auth/me");
				return res.data;
			} catch (err) {
				if (err.response?.status === 401) return null;
				toast.error(err.response?.data?.message || "Something went wrong");
				return null;
			}
		},
	});

	if (isLoading) return <div>Loading...</div>;

	return (
		<Layout>
			<Routes>
				<Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" />} />
				<Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
				<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
				<Route path='/notifications' element={<ProtectedRoute authUser={authUser}><NotificationsPage /></ProtectedRoute>} />
				<Route path='/network' element={<ProtectedRoute authUser={authUser}><NetworkPage /></ProtectedRoute>} />
				<Route path='/post/:postId' element={<ProtectedRoute authUser={authUser}><PostPage /></ProtectedRoute>} />
				<Route path='/profile/:username' element={<ProtectedRoute authUser={authUser}><ProfilePage /></ProtectedRoute>} />

				{/* ✅ Add Chat Route (Only accessible if logged in) */}
				{/* <Route path='/chat' element={<ProtectedRoute authUser={authUser}><ChatComponent /></ProtectedRoute>} /> */}
			</Routes>
			<Toaster />
		</Layout>
	);
}

export default App;
