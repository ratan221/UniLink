import { Link } from "react-router-dom";
import { Home, UserPlus, Bell } from "lucide-react";

export default function Sidebar({ user }) {
    return (
        <div className='bg-white shadow-lg rounded-xl overflow-hidden'>
            <div className='relative'>
                <div
                    className='h-20 bg-cover bg-center'
                    style={{ backgroundImage: `url("${user.bannerImg || "/banner.png"}")` }}
                />
                <div className='flex flex-col items-center mt-[-40px]'>
                    <Link to={`/profile/${user.username}`}>
                        <img
                            src={user.profilePicture || "/avatar.png"}
                            alt={user.name}
                            className='w-24 h-24 rounded-full border-4 border-white shadow-lg'
                        />
                    </Link>
                    <h2 className='text-lg font-semibold mt-2 text-gray-900'>{user.name}</h2>
                    <p className='text-sm text-gray-500'>{user.headline}</p>
                    <p className='text-xs text-gray-400'>{user.connections.length} connections</p>
                </div>
            </div>
            <div className='mt-4 px-6 py-4'>
                <nav>
                    <ul className='space-y-3'>
                        <li>
                            <Link
                                to='/'
                                className='flex items-center py-2 px-4 rounded-lg text-gray-700 hover:bg-blue-100 transition-colors'
                            >
                                <Home className='mr-3 text-blue-500' size={22} /> Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                to='/network'
                                className='flex items-center py-2 px-4 rounded-lg text-gray-700 hover:bg-blue-100 transition-colors'
                            >
                                <UserPlus className='mr-3 text-blue-500' size={22} /> My Network
                            </Link>
                        </li>
                        <li>
                            <Link
                                to='/notifications'
                                className='flex items-center py-2 px-4 rounded-lg text-gray-700 hover:bg-blue-100 transition-colors'
                            >
                                <Bell className='mr-3 text-blue-500' size={22} /> Notifications
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
            <div className='border-t border-gray-200 px-6 py-4 text-center'>
                <Link
                    to={`/profile/${user.username}`}
                    className='text-sm font-semibold text-blue-600 hover:underline'
                >
                    Visit your profile
                </Link>
            </div>
        </div>
    );
}
