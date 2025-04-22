import Sidebar from "../components/Sidebar";
import { UserPlus } from "lucide-react";
import FriendRequest from "../components/FriendRequest";
import UserCard from "../components/UserCard";
import toast from "react-hot-toast";
import { fireApi } from "../utils/useFire";
import React from "react";

const NetworkPage = () => {

	const [connectionRequests, setConnectionRequests] = React.useState([]);
	const [connections, setConnections] = React.useState([]);
	const getSugestion = async () => {
		try {
			const response = await fireApi('/suggestions', 'GET');
			setConnections(response);
		} catch (error) {
			console.error('Error in getSugestion:', error);
			toast.error(error.message || 'Something went wrong!');
		}
	};

	const getConnetionRequests = async () => {
		try {
			const response = await fireApi('/connections/requests', 'GET');
			setConnectionRequests(response);
		} catch (error) {
			console.error('Error in getConnetionRequests:', error);
			toast.error(error.message || 'Something went wrong!');
		}
	}

	React.useEffect(() => {
		getConnetionRequests();
		getSugestion();
	}, []);

	return (
		<div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
			<div className='col-span-1 lg:col-span-1'>
				<Sidebar  />
			</div>
			<div className='col-span-1 lg:col-span-3'>
				<div className='bg-secondary rounded-lg shadow p-6 mb-6'>
					<h1 className='text-2xl font-bold mb-6'>My Network</h1>

					{connectionRequests?.length > 0 ? (
						<div className='mb-8'>
							<h2 className='text-xl font-semibold mb-2'>Connection Request</h2>
							<div className='space-y-4'>
								{connectionRequests.map((request) => (
									<FriendRequest key={request.id} request={request} getConnetionRequests={getConnetionRequests} getSugestion={getSugestion}/>
								))}
							</div>
						</div>
					) : (
						<div className='bg-white rounded-lg shadow p-6 text-center mb-6'>
							<UserPlus size={48} className='mx-auto text-gray-400 mb-4' />
							<h3 className='text-xl font-semibold mb-2'>No Connection Requests</h3>
							<p className='text-gray-600'>
								You don&apos;t have any pending connection requests at the moment.
							</p>
							<p className='text-gray-600 mt-2'>
								Explore suggested connections below to expand your network!
							</p>
						</div>
					)}

					{connections?.length > 0 && (
						<div className='mb-8'>
							<h2 className='text-xl font-semibold mb-4'>My Sugestion</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
								{connections.map((connection) => (
									<UserCard key={connection._id} userDetails={connection} getSugestion={getSugestion}/>
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
