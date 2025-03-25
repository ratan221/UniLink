import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import { UserPlus } from "lucide-react";
import FriendRequest from "../components/FriendRequest";
import UserCard from "../components/UserCard";

const NetworkPage = () => {
	// Fetch authenticated user
	const { data: user, isLoading: isUserLoading } = useQuery({
		queryKey: ["authUser"],
		queryFn: async () => {
			const res = await axiosInstance.get("/auth/user");
			return res.data;
		},
	});

	// Fetch connection requests
	const { data: connectionRequests } = useQuery({
		queryKey: ["connectionRequests"],
		queryFn: async () => {
			const res = await axiosInstance.get("/connections/requests");
			return res.data;
		},
	});

	// Fetch connections
	const { data: connections } = useQuery({
		queryKey: ["connections"],
		queryFn: async () => {
			const res = await axiosInstance.get("/connections");
			return res.data;
		},
	});

	return (
		<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
			<div className="col-span-1 lg:col-span-1">
				{!isUserLoading && user && <Sidebar user={user} />}
			</div>

			<div className="col-span-1 lg:col-span-3">
				<div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
					<h1 className="text-3xl font-bold text-gray-800 mb-6">My Network</h1>

					{connectionRequests?.length > 0 ? (
						<div className="mb-8">
							<h2 className="text-xl font-semibold text-gray-800 mb-2">
								Connection Requests
							</h2>
							<div className="space-y-4">
								{connectionRequests.map((request) => (
									<FriendRequest key={request.id} request={request} />
								))}
							</div>
						</div>
					) : (
						<div className="bg-gray-100 rounded-lg shadow-md p-6 text-center mb-6">
							<UserPlus size={48} className="mx-auto text-gray-400 mb-4" />
							<h3 className="text-xl font-semibold text-gray-800 mb-2">
								No Connection Requests
							</h3>
							<p className="text-gray-600">
								You don&apos;t have any pending connection requests at the moment.
							</p>
							<p className="text-gray-600 mt-2">
								Explore suggested connections below to expand your network!
							</p>
						</div>
					)}

					{connections?.length > 0 && (
						<div className="mb-8">
							<h2 className="text-xl font-semibold text-gray-800 mb-4">
								My Connections
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{connections.map((connection) => (
									<UserCard key={connection._id} user={connection} isConnection={true} />
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default NetworkPage;
