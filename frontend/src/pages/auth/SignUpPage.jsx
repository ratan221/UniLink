import { Link } from "react-router-dom";
import SignUpForm from "../../components/auth/SignupForm";
import logo from '../../assets/logo1.png';

const SignUpPage = () => {
	return (
		<div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
			            <img className= "mx-auto" src={logo} alt="Logo" width="190" />
				<h2 className="mt-4 text-3xl font-bold text-gray-900">
					Join UniLink today
					
				</h2>
				<p className="mt-2 text-sm text-gray-600">
					Make the most of your professional life.
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-6 shadow-lg rounded-lg sm:px-10">
					<SignUpForm />

					<div className="mt-6">
						<div className="relative flex items-center">
							<div className="w-full border-t border-gray-300"></div>
							<span className="px-4 bg-white text-sm text-gray-500 absolute left-1/2 transform -translate-x-1/2">
								Already on UniLink?
							</span>
						</div>
						<div className="mt-6">
							<Link
								to="/login"
								className="w-full flex justify-center py-2 px-4 border rounded-md text-sm font-medium text-blue-600 bg-white shadow-sm hover:bg-blue-50 transition"
							>
								Sign in
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignUpPage;
