const Footer = () => {
	return (
		<footer className="bg-gray-800 text-white py-6 mt-auto">
			<div className="container mx-auto px-4">
				<div className="flex flex-col md:flex-row justify-between items-center">
					<div className="mb-4 md:mb-0">
						<p className="text-sm">
							Made with ❤️ by <span className="font-semibold">Avi</span>
						</p>
					</div>
					<div className="text-sm text-gray-400">
						<p>
							&copy; {new Date().getFullYear()} Fintech Expense Tracker. All
							rights reserved.
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
