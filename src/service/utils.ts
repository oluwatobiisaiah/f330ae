import { Form, GraphResponse } from "../types/api";

// Determine if a value is a mapping reference (starts with a form ID or global)
export const isMappingReference = (
	value: string,
	graphData: GraphResponse | null,
) => {
	return (
		typeof value === "string" &&
		(value.startsWith("global.") ||
			graphData?.forms.some((form: Form) => value.startsWith(form.id + ".")))
	);
};

export const getFormattedMappingInfo = (
	value: string,
	graphData: GraphResponse | null,
) => {
	if (!graphData || typeof value !== "string") {
		return { formName: "Unknown", fieldName: value };
	}

	if (value.startsWith("global.")) {
		const parts = value.split(".");
		return {
			formName: "Global Data",
			fieldName: parts[1] || "",
		};
	}

	const parts = value.split(".");
	if (parts.length < 2) {
		return { formName: "Unknown", fieldName: value };
	}

	const formId = parts[0];
	const fieldName = parts[1];

	const parentForm = graphData.forms.find((form) => form.id === formId);
	return {
		formName: parentForm?.name || "Unknown Form",
		fieldName,
	};
};
