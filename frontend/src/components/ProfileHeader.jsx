// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useMemo, useState } from "react";
// import { axiosInstance } from "../lib/axios";
// import { toast } from "react-hot-toast";
// import EditProfilePopup from "./EditProfilePopup";

// import { Camera, Clock, MapPin, UserCheck, UserPlus, X } from "lucide-react";

// const ProfileHeader = ({ userData, onSave, isOwnProfile }) => {
// 	const [isEditing, setIsEditing] = useState(false);
// 	const [editedData, setEditedData] = useState({});
// 	const queryClient = useQueryClient();

// 	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

// 	const { data: connectionStatus, refetch: refetchConnectionStatus } = useQuery({
// 		queryKey: ["connectionStatus", userData._id],
// 		queryFn: () => axiosInstance.get(`/connections/status/${userData._id}`),
// 		enabled: !isOwnProfile,
// 	});

// 	const isConnected = userData.connections.some((connection) => connection === authUser._id);

// 	const { mutate: sendConnectionRequest } = useMutation({
// 		mutationFn: (userId) => axiosInstance.post(`/connections/request/${userId}`),
// 		onSuccess: () => {
// 			toast.success("Connection request sent");
// 			refetchConnectionStatus();
// 			queryClient.invalidateQueries(["connectionRequests"]);
// 		},
// 		onError: (error) => {
// 			toast.error(error.response?.data?.message || "An error occurred");
// 		},
// 	});

// 	const { mutate: acceptRequest } = useMutation({
// 		mutationFn: (requestId) => axiosInstance.put(`/connections/accept/${requestId}`),
// 		onSuccess: () => {
// 			toast.success("Connection request accepted");
// 			refetchConnectionStatus();
// 			queryClient.invalidateQueries(["connectionRequests"]);
// 		},
// 		onError: (error) => {
// 			toast.error(error.response?.data?.message || "An error occurred");
// 		},
// 	});

// 	const { mutate: rejectRequest } = useMutation({
// 		mutationFn: (requestId) => axiosInstance.put(`/connections/reject/${requestId}`),
// 		onSuccess: () => {
// 			toast.success("Connection request rejected");
// 			refetchConnectionStatus();
// 			queryClient.invalidateQueries(["connectionRequests"]);
// 		},
// 		onError: (error) => {
// 			toast.error(error.response?.data?.message || "An error occurred");
// 		},
// 	});

// 	const { mutate: removeConnection } = useMutation({
// 		mutationFn: (userId) => axiosInstance.delete(`/connections/${userId}`),
// 		onSuccess: () => {
// 			toast.success("Connection removed");
// 			refetchConnectionStatus();
// 			queryClient.invalidateQueries(["connectionRequests"]);
// 		},
// 		onError: (error) => {
// 			toast.error(error.response?.data?.message || "An error occurred");
// 		},
// 	});

// 	const getConnectionStatus = useMemo(() => {
// 		if (isConnected) return "connected";
// 		if (!isConnected) return "not_connected";
// 		return connectionStatus?.data?.status;
// 	}, [isConnected, connectionStatus]);

// 	const renderConnectionButton = () => {
// 		const baseClass = "text-white py-2 px-4 rounded-full transition duration-300 flex items-center justify-center";
// 		switch (getConnectionStatus) {
// 			case "connected":
// 				return (
// 					<div className='flex gap-2 justify-center'>
// 						<div className={`${baseClass} bg-green-500 hover:bg-green-600`}>
// 							<UserCheck size={20} className='mr-2' />
// 							Connected
// 						</div>
// 						<button
// 							className={`${baseClass} bg-red-500 hover:bg-red-600 text-sm`}
// 							onClick={() => removeConnection(userData._id)}
// 						>
// 							<X size={20} className='mr-2' />
// 							Remove Connection
// 						</button>
// 					</div>
// 				);

// 			case "pending":
// 				return (
// 					<button className={`${baseClass} bg-yellow-500 hover:bg-yellow-600`}>
// 						<Clock size={20} className='mr-2' />
// 						Pending
// 					</button>
// 				);

// 			case "received":
// 				return (
// 					<div className='flex gap-2 justify-center'>
// 						<button
// 							onClick={() => acceptRequest(connectionStatus.data.requestId)}
// 							className={`${baseClass} bg-green-500 hover:bg-green-600`}
// 						>
// 							Accept
// 						</button>
// 						<button
// 							onClick={() => rejectRequest(connectionStatus.data.requestId)}
// 							className={`${baseClass} bg-red-500 hover:bg-red-600`}
// 						>
// 							Reject
// 						</button>
// 					</div>
// 				);
// 			default:
// 				return (
// 					<button
// 						onClick={() => sendConnectionRequest(userData._id)}
// 						className='bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-full transition duration-300 flex items-center justify-center'
// 					>
// 						<UserPlus size={20} className='mr-2' />
// 						Connect
// 					</button>
// 				);
// 		}
// 	};

// 	const handleImageChange = (event) => {
// 		const file = event.target.files[0];
// 		if (file) {
// 			const reader = new FileReader();
// 			reader.onloadend = () => {
// 				setEditedData((prev) => ({ ...prev, [event.target.name]: reader.result }));
// 			};
// 			reader.readAsDataURL(file);
// 		}
// 	};

// 	const handleSave = () => {
// 		onSave(editedData);
// 		setIsEditing(false);
// 	};

// 	return (
// 		<div className='bg-white shadow rounded-lg mb-6'>
// 			<div
// 				className='relative h-48 rounded-t-lg bg-cover bg-center'
// 				style={{
// 					backgroundImage: `url('${editedData.bannerImg || userData.bannerImg || "/banner.png"}')`,
// 				}}
// 			>
// 				{isEditing && (
// 					<label className='absolute top-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer'>
// 						<Camera size={20} />
// 						<input
// 							type='file'
// 							className='hidden'
// 							name='bannerImg'
// 							onChange={handleImageChange}
// 							accept='image/*'
// 						/>
// 					</label>
// 				)}
// 			</div>

// 			<div className='p-4'>
// 				<div className='relative -mt-20 mb-4'>
// 					<img
// 						className='w-32 h-32 rounded-full mx-auto object-cover'
// 						src={editedData.profilePicture || userData.profilePicture || "/avatar.png"}
// 						alt={userData.name}
// 					/>

// 					{isEditing && (
// 						<label className='absolute bottom-0 right-1/2 transform translate-x-16 bg-white p-2 rounded-full shadow cursor-pointer'>
// 							<Camera size={20} />
// 							<input
// 								type='file'
// 								className='hidden'
// 								name='profilePicture'
// 								onChange={handleImageChange}
// 								accept='image/*'
// 							/>
// 						</label>
// 					)}
// 				</div>

// 				<div className="text-center mb-6">
// 	{isEditing ? (
// 		<input
// 			type="text"
// 			value={editedData.name ?? userData.name}
// 			onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
// 			className="text-3xl font-bold mb-2 text-center w-full bg-white text-black border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
// 			placeholder="Enter your name"
// 		/>
// 	) : (
// 		<h1 className="text-3xl font-semibold text-gray-900">{userData.name}</h1>
// 	)}

// 	{isEditing ? (
// 		<input
// 			type="text"
// 			value={editedData.headline ?? userData.headline}
// 			onChange={(e) => setEditedData({ ...editedData, headline: e.target.value })}
// 			className="text-lg text-gray-800 text-center w-full bg-white border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
// 			placeholder="Enter your headline"
// 		/>
// 	) : (
// 		<p className="text-lg text-gray-600 mt-1">{userData.headline}</p>
// 	)}

// 	<div className="flex justify-center items-center gap-2 mt-3 text-gray-500">
// 		<MapPin size={18} />
// 		{isEditing ? (
// 			<input
// 				type="text"
// 				value={editedData.location ?? userData.location}
// 				onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
// 				className="text-base text-black text-center w-auto bg-white border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
// 				placeholder="Enter your location"
// 			/>
// 		) : (
// 			<span className="text-base">{userData.location}</span>
// 		)}
// 	</div>
// </div>


// 				{isOwnProfile ? (
// 					isEditing ? (
// 						<button
// 							className='w-full bg-primary text-white py-2 px-4 rounded-full hover:bg-primary-dark
// 							 transition duration-300'
// 							onClick={handleSave}
// 						>
// 							Save Profile
// 						</button>
// 					) : (
// 						<button
// 							onClick={() => setIsEditing(true)}
// 							className='w-full bg-primary text-white py-2 px-4 rounded-full hover:bg-primary-dark
// 							 transition duration-300'
// 						>
// 							Edit Profile
// 						</button>
// 					)
// 				) : (
// 					<div className='flex justify-center'>{renderConnectionButton()}</div>
// 				)}
// 			</div>
// 		</div>
// 	);
// };
// export default ProfileHeader;








//-----------------------------------------------------------------------------------------//

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import EditProfilePopup from "./EditProfilePopup";
import { Clock, MapPin, UserCheck, UserPlus, X, Pencil } from "lucide-react";

const ProfileHeader = ({ userData, onSave, isOwnProfile }) => {
    const [showEditPopup, setShowEditPopup] = useState(false);
    const queryClient = useQueryClient();

    const { data: authUser } = useQuery({
        queryKey: ["authUser"],
        queryFn: () => axiosInstance.get("/auth/user").then((res) => res.data), // Provide the API call
    });

    const { data: connectionStatus, refetch: refetchConnectionStatus } = useQuery({
        queryKey: ["connectionStatus", userData._id],
        queryFn: () => axiosInstance.get(`/connections/status/${userData._id}`),
        enabled: !isOwnProfile,
    });

    const isConnected = userData.connections.some((connection) => connection === authUser._id);

    // Connection mutations
    const { mutate: sendConnectionRequest } = useMutation({
        mutationFn: (userId) => axiosInstance.post(`/connections/request/${userId}`),
        onSuccess: () => {
            toast.success("Connection request sent");
            refetchConnectionStatus();
            queryClient.invalidateQueries(["connectionRequests"]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "An error occurred");
        },
    });

    const { mutate: acceptRequest } = useMutation({
        mutationFn: (requestId) => axiosInstance.put(`/connections/accept/${requestId}`),
        onSuccess: () => {
            toast.success("Connection request accepted");
            refetchConnectionStatus();
            queryClient.invalidateQueries(["connectionRequests"]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "An error occurred");
        },
    });

    const { mutate: rejectRequest } = useMutation({
        mutationFn: (requestId) => axiosInstance.put(`/connections/reject/${requestId}`),
        onSuccess: () => {
            toast.success("Connection request rejected");
            refetchConnectionStatus();
            queryClient.invalidateQueries(["connectionRequests"]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "An error occurred");
        },
    });

    const { mutate: removeConnection } = useMutation({
        mutationFn: (userId) => axiosInstance.delete(`/connections/${userId}`),
        onSuccess: () => {
            toast.success("Connection removed");
            refetchConnectionStatus();
            queryClient.invalidateQueries(["connectionRequests"]);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "An error occurred");
        },
    });

    const getConnectionStatus = useMemo(() => {
        if (isConnected) return "connected";
        if (!isConnected) return "not_connected";
        return connectionStatus?.data?.status;
    }, [isConnected, connectionStatus]);

    const renderConnectionButton = () => {
        const baseClass = "px-6 py-2.5 rounded-full font-medium transition-all duration-200 flex items-center justify-center gap-2";
        
        switch (getConnectionStatus) {
            case "connected":
                return (
                    <div className="flex gap-3">
                        <button className={`${baseClass} bg-green-50 text-green-600`} disabled>
                            <UserCheck size={20} />
                            Connected
                        </button>
                        <button
                            onClick={() => removeConnection(userData._id)}
                            className={`${baseClass} bg-red-50 text-red-600 hover:bg-red-100`}
                        >
                            <X size={20} />
                            Remove
                        </button>
                    </div>
                );
            case "pending":
                return (
                    <button className={`${baseClass} bg-amber-50 text-amber-600`} disabled>
                        <Clock size={20} />
                        Pending
                    </button>
                );
            case "received":
                return (
                    <div className="flex gap-3">
                        <button
                            onClick={() => acceptRequest(connectionStatus.data.requestId)}
                            className={`${baseClass} bg-green-50 text-green-600 hover:bg-green-100`}
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => rejectRequest(connectionStatus.data.requestId)}
                            className={`${baseClass} bg-red-50 text-red-600 hover:bg-red-100`}
                        >
                            Reject
                        </button>
                    </div>
                );
            default:
                return (
                    <button
                        onClick={() => sendConnectionRequest(userData._id)}
                        className={`${baseClass} bg-blue-50 text-blue-600 hover:bg-blue-100`}
                    >
                        <UserPlus size={20} />
                        Connect
                    </button>
                );
        }
    };

    const handleSaveProfile = (editedData) => {
        onSave(editedData);
        setShowEditPopup(false);
        toast.success("Profile updated successfully");
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
            {/* Banner */}
            <div
                className="h-48 bg-cover bg-center"
                style={{
                    backgroundImage: `url('${userData.bannerImg || "/banner.png"}')`
                }}
            />

            <div className="px-6 pb-6">
                {/* Profile Picture */}
                <div className="relative -mt-20 mb-4">
                    <img
                        src={userData.profilePicture || "/avatar.png"}
                        alt={userData.name}
                        className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover mx-auto"
                    />
                    {isOwnProfile && (
                        <button
                            onClick={() => setShowEditPopup(true)}
                            className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition"
                        >
                            <Pencil size={20} className="text-gray-600 hover:text-blue-600 transition" />
                        </button>
                    )}
                </div>

                {/* Profile Info */}
                <div className="text-center space-y-3">
                    <h1 className="text-2xl font-bold text-gray-900">{userData.name}</h1>
                    <p className="text-lg text-gray-600">{userData.headline}</p>
                    <div className="flex items-center justify-center text-gray-500 gap-2">
                        <MapPin size={18} />
                        <span>{userData.location}</span>
                    </div>
                </div>

                {/* Action Button */}
                <div className="mt-6 flex justify-center">
                    {!isOwnProfile && renderConnectionButton()}
                </div>
            </div>

            {/* Edit Profile Popup */}
            {showEditPopup && (
                <EditProfilePopup
                    userData={userData}
                    onSave={handleSaveProfile}
                    onClose={() => setShowEditPopup(false)}
                />
            )}
        </div>
    );
};

export default ProfileHeader;
