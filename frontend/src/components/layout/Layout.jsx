import Navbar from "./Navbar";

const Layout = ({ children }) => {
	return (
		<div className='min-h-screen '>
			<Navbar />
			<main className='max-w-none mx-auto px-20 py-6'>{children}</main>
		</div>
	);
};
export default Layout;