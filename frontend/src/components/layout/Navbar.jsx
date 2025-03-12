import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Link } from "react-router-dom";
import { Bell, Home, LogOut, User, Users } from "lucide-react";
import logo from '../../assets/logo.png';

const Navbar = () => {
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const queryClient = useQueryClient();

	const { data: notifications } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => axiosInstance.get("/notifications"),
		enabled: !!authUser,
	});

	const { data: connectionRequests } = useQuery({
		queryKey: ["connectionRequests"],
		queryFn: async () => axiosInstance.get("/connections/requests"),
		enabled: !!authUser,
	});

	const { mutate: logout } = useMutation({
		mutationFn: () => axiosInstance.post("/auth/logout"),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
	});

	const unreadNotificationCount = notifications?.data.filter((notif) => !notif.read).length;
	const unreadConnectionRequestsCount = connectionRequests?.data?.length;

	return (
		<nav className='bg-white text-gray-900 shadow-md sticky top-0 z-10'>
			<div className='max-w-7xl mx-auto px-6 md:px-12'>
				<div className='flex justify-between items-center py-4'>
					<div className='flex items-center space-x-4'>
						<Link to='/'>
							<img className='h-10 md:h-12 rounded-md' src={logo} alt='UniLinkn' />
						</Link>
					</div>
					<div className='flex items-center gap-4 md:gap-8'>
						{authUser ? (
							<>
								<Link to={"/"} className='text-gray-700 hover:text-blue-600 transition duration-300 flex flex-col items-center'>
									<Home size={22} />
									<span className='text-xs hidden md:block'>Home</span>
								</Link>
								<Link to='/network' className='text-gray-700 hover:text-blue-600 transition duration-300 flex flex-col items-center relative'>
									<Users size={22} />
									<span className='text-xs hidden md:block'>My Network</span>
									{unreadConnectionRequestsCount > 0 && (
										<span className='absolute -top-2 -right-2 md:right-4 bg-red-500 text-white text-xs 
										rounded-full size-4 md:size-5 flex items-center justify-center font-semibold'>
											{unreadConnectionRequestsCount}
										</span>
									)}
								</Link>
								<Link to='/notifications' className='text-gray-700 hover:text-blue-600 transition duration-300 flex flex-col items-center relative'>
									<Bell size={22} />
									<span className='text-xs hidden md:block'>Notifications</span>
									{unreadNotificationCount > 0 && (
										<span className='absolute -top-2 -right-2 md:right-4 bg-red-500 text-white text-xs 
										rounded-full size-4 md:size-5 flex items-center justify-center font-semibold'>
											{unreadNotificationCount}
										</span>
									)}
								</Link>
								<Link
									to={`/profile/${authUser.username}`}
									className='text-gray-700 hover:text-blue-600 transition duration-300 flex flex-col items-center'
								>
									<User size={22} />
									<span className='text-xs hidden md:block'>Me</span>
								</Link>
								<button
									className='flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition duration-300'
									onClick={() => logout()}
								>
									<LogOut size={22} />
									<span className='hidden md:inline'>Logout</span>
								</button>
							</>
						) : (
							<>
								<Link to='/login' className='px-4 py-2 bg-transparent text-gray-700 border border-gray-400 rounded-md hover:text-blue-600 hover:border-blue-600 transition duration-300'>
									Sign In
								</Link>
								<Link to='/signup' className='px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition duration-300'>
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
