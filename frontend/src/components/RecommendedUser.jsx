import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Check, Clock, UserCheck, UserPlus, X } from "lucide-react";

const RecommendedUser = ({ user }) => {
    const queryClient = useQueryClient();

    const { data: connectionStatus, isLoading } = useQuery({
        queryKey: ["connectionStatus", user._id],
        queryFn: () => axiosInstance.get(`/connections/status/${user._id}`),
    });

    const { mutate: sendConnectionRequest } = useMutation({
        mutationFn: (userId) => axiosInstance.post(`/connections/request/${userId}`),
        onSuccess: () => {
            toast.success("Connection request sent successfully");
            queryClient.invalidateQueries({ queryKey: ["connectionStatus", user._id] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || "An error occurred");
        },
    });

    const { mutate: acceptRequest } = useMutation({
        mutationFn: (requestId) => axiosInstance.put(`/connections/accept/${requestId}`),
        onSuccess: () => {
            toast.success("Connection request accepted");
            queryClient.invalidateQueries({ queryKey: ["connectionStatus", user._id] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || "An error occurred");
        },
    });

    const { mutate: rejectRequest } = useMutation({
        mutationFn: (requestId) => axiosInstance.put(`/connections/reject/${requestId}`),
        onSuccess: () => {
            toast.success("Connection request rejected");
            queryClient.invalidateQueries({ queryKey: ["connectionStatus", user._id] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || "An error occurred");
        },
    });

    const renderButton = () => {
        if (isLoading) {
            return (
                <button className='px-4 py-2 rounded-md bg-gray-100 text-gray-500 text-sm font-medium' disabled>
                    Loading...
                </button>
            );
        }

        switch (connectionStatus?.data?.status) {
            case "pending":
                return (
                    <button className='px-4 py-2 rounded-md bg-amber-50 text-amber-600 text-sm font-medium flex items-center' disabled>
                        <Clock size={16} className='mr-2' />
                        Pending
                    </button>
                );
            case "received":
                return (
                    <div className='flex gap-2'>
                        <button
                            onClick={() => acceptRequest(connectionStatus.data.requestId)}
                            className='px-3 py-2 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors duration-200'
                            title="Accept Request"
                        >
                            <Check size={16} />
                        </button>
                        <button
                            onClick={() => rejectRequest(connectionStatus.data.requestId)}
                            className='px-3 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors duration-200'
                            title="Reject Request"
                        >
                            <X size={16} />
                        </button>
                    </div>
                );
            case "connected":
                return (
                    <button className='px-4 py-2 rounded-md bg-emerald-50 text-emerald-600 text-sm font-medium flex items-center' disabled>
                        <UserCheck size={16} className='mr-2' />
                        Connected
                    </button>
                );
            default:
                return (
                    <button
                        className='px-4 py-2 rounded-md border border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors duration-200 text-sm font-medium flex items-center'
                        onClick={handleConnect}
                    >
                        <UserPlus size={16} className='mr-2' />
                        Connect
                    </button>
                );
        }
    };

    const handleConnect = () => {
        if (connectionStatus?.data?.status === "not_connected") {
            sendConnectionRequest(user._id);
        }
    };

    return (
        <div className='flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200 rounded-lg'>
            <Link to={`/profile/${user.username}`} className='flex items-center flex-grow group'>
                <img
                    src={user.profilePicture || "/avatar.png"}
                    alt={user.name}
                    className='w-12 h-12 rounded-full object-cover border border-gray-200'
                />
                <div className='ml-4'>
                    <h3 className='font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200'>
                        {user.name}
                    </h3>
                    <p className='text-sm text-gray-500'>{user.headline}</p>
                </div>
            </Link>
            <div className='ml-4'>{renderButton()}</div>
        </div>
    );
};

export default RecommendedUser;