import React from "react";
import ConversionForm from "../components/ConversionForm";
import ConversionHistory from "../components/ConversionHistory";

const Convert = () => {
	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-4">Currency Conversion</h1>
			<div className="max-w-4xl mx-auto">
				<ConversionForm />
				<ConversionHistory />
			</div>
		</div>
	);
};

export default Convert;
