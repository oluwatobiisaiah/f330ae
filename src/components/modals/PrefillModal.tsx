import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Typography,
	Box,
	Divider,
	FormHelperText,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Chip,
	Tooltip,
} from "@mui/material";
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	Close as CloseIcon,
	Link as LinkIcon,
} from "@mui/icons-material";
import type { Form, GraphResponse } from "../../types/api";
import PrefillPanelModal from "./PrefillPanelModal";
import {
	getFormattedMappingInfo,
	isMappingReference,
} from "../../service/utils";

interface PrefillModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (values: Record<string, any>) => void;
	form: Form | null;
	nodeId: string;
	graphData: GraphResponse | null;
	initialValues?: Record<string, any>;
}

export default function PrefillModal({
	open,
	onClose,
	onSave,
	form,
	nodeId,
	graphData,
	initialValues = {},
}: PrefillModalProps) {
	const [values, setValues] = useState<Record<string, any>>(initialValues);
	const [selectedField, setSelectedField] = useState<string>("");
	const [fieldValue, setFieldValue] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [panelModalOpen, setPanelModalOpen] = useState(false);
	const [emptyField, setEmptyField] = useState<string | null>(null);
	const [editingField, setEditingField] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			setValues(initialValues);
			setSelectedField("");
			setFieldValue("");
			setError(null);
			setEditingField(null);
		}
	}, [open, initialValues]);

	const handleFieldChange = (
		event: React.ChangeEvent<HTMLInputElement> | { target: { value: string } },
	) => {
		const field = event.target.value as string;
		setSelectedField(field);
		setError(null);
	};

	const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFieldValue(event.target.value);
	};

	const handleAddField = () => {
		if (!selectedField) {
			setError("Please select a field");
			return;
		}

		// If field is empty, open the panel modal
		if (!fieldValue) {
			setEmptyField(selectedField);
			setPanelModalOpen(true);
			return;
		}

		setValues({
			...values,
			[selectedField]: fieldValue,
		});

		setSelectedField("");
		setFieldValue("");
	};

	const handleEditField = (field: string) => {
		setEditingField(field);
		setSelectedField(field);
		setFieldValue(values[field]);
	};

	const handleUpdateField = () => {
		if (editingField) {
			if (!fieldValue) {
				setEmptyField(editingField);
				setPanelModalOpen(true);
				return;
			}

			setValues({
				...values,
				[editingField]: fieldValue,
			});

			setSelectedField("");
			setFieldValue("");
			setEditingField(null);
		}
	};

	const handleRemoveField = (field: string) => {
		const newValues = { ...values };
		delete newValues[field];
		setValues(newValues);

		// If we were editing this field, reset the editing state
		if (editingField === field) {
			setEditingField(null);
			setSelectedField("");
			setFieldValue("");
		}
	};

	const handleSave = () => {
		onSave(values);
	};

	const handleClosePanelModal = () => {
		setPanelModalOpen(false);
		setEmptyField(null);
	};

	const handlePanelModalSave = (mappingValue: string) => {
		if (emptyField) {
			if (editingField) {
				setValues({
					...values,
					[editingField]: mappingValue,
				});
				setEditingField(null);
			} else {
				setValues({
					...values,
					[emptyField]: mappingValue,
				});
			}

			setSelectedField("");
			setFieldValue("");
			setEmptyField(null);
			setPanelModalOpen(false);
		}
	};

	const handleOpenMappingPanel = () => {
		setEmptyField(selectedField || "");
		setPanelModalOpen(true);
	};

	const handleCancelEdit = () => {
		setEditingField(null);
		setSelectedField("");
		setFieldValue("");
	};

	// Extract available fields from the form schema
	const availableFields: Record<string, any> = {};
	if (form && form.field_schema && form.field_schema.properties) {
		Object.entries(form.field_schema.properties).forEach(([key, value]) => {
			if (typeof value === "object" && value !== null) {
				availableFields[key] = value;
			}
		});
	}

	// Filter out fields that are already added (unless we're editing one)
	const availableFieldOptions = Object.keys(availableFields).filter(
		(field) => !values[field] || field === editingField,
	);

	return (
		<>
			<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
				<DialogTitle>
					<Box
						display="flex"
						justifyContent="space-between"
						alignItems="center"
					>
						<Typography variant="h6">Prefill</Typography>
						<IconButton
							edge="end"
							color="inherit"
							onClick={onClose}
							aria-label="close"
						>
							<CloseIcon />
						</IconButton>
					</Box>
					{form && (
						<Typography variant="subtitle2" color="text.secondary">
							Prefill fields for {form.name}
						</Typography>
					)}
				</DialogTitle>

				<DialogContent dividers>
					<Box sx={{ mb: 3 }}>
						<Typography variant="subtitle1" gutterBottom>
							{editingField ? "Edit Prefill Value" : "Add New Prefill Value"}
						</Typography>

						<FormControl
							fullWidth
							sx={{ mb: 2 }}
							error={!!error}
							disabled={!!editingField}
						>
							<InputLabel id="field-select-label">Select Field</InputLabel>
							<Select
								labelId="field-select-label"
								value={selectedField}
								label="Select Field"
								onChange={handleFieldChange}
							>
								{availableFieldOptions.map((field) => (
									<MenuItem key={field} value={field}>
										{field} ({availableFields[field].type})
									</MenuItem>
								))}
							</Select>
							{error && <FormHelperText>{error}</FormHelperText>}
						</FormControl>

						<Box sx={{ display: "flex", mb: 2 }}>
							<TextField
								label="Field Value"
								variant="outlined"
								fullWidth
								value={fieldValue}
								onChange={handleValueChange}
								sx={{ mr: 1 }}
								placeholder="Enter value or use mapping"
							/>
							<Button
								variant="outlined"
								color="primary"
								onClick={handleOpenMappingPanel}
								startIcon={<LinkIcon />}
								sx={{ whiteSpace: "nowrap" }}
							>
								Map
							</Button>
						</Box>

						<Box sx={{ display: "flex", gap: 1 }}>
							{editingField ? (
								<>
									<Button
										variant="contained"
										color="primary"
										onClick={handleUpdateField}
									>
										Update Field
									</Button>
									<Button
										variant="outlined"
										color="inherit"
										onClick={handleCancelEdit}
									>
										Cancel
									</Button>
								</>
							) : (
								<Button
									variant="contained"
									color="primary"
									onClick={handleAddField}
									disabled={!selectedField}
								>
									Add Field
								</Button>
							)}
						</Box>
					</Box>

					<Divider sx={{ my: 2 }} />

					<Typography variant="subtitle1" gutterBottom>
						Current Prefill Values
					</Typography>

					{Object.keys(values).length === 0 ? (
						<Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
							No prefill values configured
						</Typography>
					) : (
						<List sx={{ width: "100%", bgcolor: "background.paper" }}>
							{Object.entries(values).map(([field, value]) => {
								const isMapped = isMappingReference(
									value.toString(),
									graphData,
								);
								const { formName, fieldName } = isMapped
									? getFormattedMappingInfo(value.toString(), graphData)
									: { formName: "", fieldName: "" };

								return (
									<React.Fragment key={field}>
										<ListItem
											secondaryAction={
												<Box>
													<IconButton
														edge="end"
														aria-label="edit"
														onClick={() => handleEditField(field)}
														disabled={editingField === field}
													>
														<EditIcon fontSize="small" />
													</IconButton>
													<IconButton
														edge="end"
														aria-label="delete"
														onClick={() => handleRemoveField(field)}
													>
														<DeleteIcon fontSize="small" />
													</IconButton>
												</Box>
											}
										>
											<ListItemText
												primary={
													<Box sx={{ display: "flex", alignItems: "center" }}>
														<Typography variant="body1">{field}</Typography>
														{isMapped && (
															<Tooltip title={`Mapped from ${formName}`}>
																<Chip
																	icon={<LinkIcon />}
																	label="Mapped"
																	size="small"
																	color="primary"
																	variant="outlined"
																	sx={{ ml: 1 }}
																/>
															</Tooltip>
														)}
													</Box>
												}
												secondary={
													isMapped ? (
														<Typography variant="body2" color="text.secondary">
															<strong>{formName}</strong> → {fieldName}
														</Typography>
													) : (
														value.toString()
													)
												}
											/>
										</ListItem>
										<Divider component="li" />
									</React.Fragment>
								);
							})}
						</List>
					)}

					<Box sx={{ mt: 2 }}>
						<Typography variant="subtitle2" color="text.secondary">
							Node ID: {nodeId}
						</Typography>
					</Box>
				</DialogContent>

				<DialogActions>
					<Button onClick={onClose} color="inherit">
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						color="primary"
						variant="contained"
						disabled={editingField !== null}
					>
						Save Prefill Values
					</Button>
				</DialogActions>
			</Dialog>

			{panelModalOpen && (
				<PrefillPanelModal
					open={panelModalOpen}
					onClose={handleClosePanelModal}
					onSave={handlePanelModalSave}
					fieldName={emptyField || ""}
					form={form}
					nodeId={nodeId}
					graphData={graphData}
				/>
			)}
		</>
	);
}
