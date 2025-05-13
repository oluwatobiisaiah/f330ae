import type React from "react";
import { useState, useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Box,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Divider,
	IconButton,
	TextField,
	InputAdornment,
	Tabs,
	Tab,
	Accordion,
	AccordionSummary,
	AccordionDetails,
} from "@mui/material";
import {
	Close as CloseIcon,
	Search as SearchIcon,
	ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { type Form, type GraphResponse, Node, Edge } from "../../types/api";

interface PrefillPanelModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (value: string) => void;
	fieldName: string;
	form: Form | null;
	nodeId: string;
	graphData: GraphResponse | null;
}

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`mapping-tabpanel-${index}`}
			aria-labelledby={`mapping-tab-${index}`}
			{...other}
			style={{ maxHeight: "400px", overflow: "auto" }}
		>
			{value === index && <Box sx={{ p: 2 }}>{children}</Box>}
		</div>
	);
}

export default function PrefillPanelModal({
	open,
	onClose,
	onSave,
	fieldName,
	form,
	nodeId,
	graphData,
}: PrefillPanelModalProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [tabValue, setTabValue] = useState(0);
	const [directDependencies, setDirectDependencies] = useState<Form[]>([]);
	const [transitiveDependencies, setTransitiveDependencies] = useState<Form[]>(
		[],
	);

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
	};

	const handleSelectMapping = (mappingId: string) => {
		onSave(mappingId);
	};

	useEffect(() => {
		if (!open || !graphData || !nodeId || !form) return;
		const dependencies = findFormDependencies(nodeId, graphData);
		setDirectDependencies(dependencies.direct);
		setTransitiveDependencies(dependencies.transitive);
	}, [open, graphData, nodeId, form]);

	// Function to find direct and transitive form dependencies
	const findFormDependencies = (
		currentNodeId: string,
		graphData: GraphResponse,
	) => {
		const direct: Form[] = [];
		const transitive: Form[] = [];
		const visited = new Set<string>();

		const incomingEdges = graphData.edges.filter(
			(edge) => edge.target === currentNodeId,
		);

		incomingEdges.forEach((edge) => {
			const sourceNode = graphData.nodes.find(
				(node) => node.id === edge.source,
			);
			if (sourceNode) {
				const sourceForm = graphData.forms.find(
					(form) => form.id === sourceNode.data.component_id,
				);
				if (sourceForm) {
					direct.push(sourceForm);
				}

				findTransitiveDependencies(edge.source, graphData, transitive, visited);
			}
		});

		return { direct, transitive };
	};

	// Recursive function to find transitive dependencies
	const findTransitiveDependencies = (
		nodeId: string,
		graphData: GraphResponse,
		result: Form[],
		visited: Set<string>,
	) => {
		if (visited.has(nodeId)) return;
		visited.add(nodeId);

		const incomingEdges = graphData.edges.filter(
			(edge) => edge.target === nodeId,
		);
		incomingEdges.forEach((edge) => {
			const sourceNode = graphData.nodes.find(
				(node) => node.id === edge.source,
			);
			if (sourceNode) {
				const sourceForm = graphData.forms.find(
					(form) => form.id === sourceNode.data.component_id,
				);
				if (sourceForm && !result.some((f) => f.id === sourceForm.id)) {
					result.push(sourceForm);
				}
				findTransitiveDependencies(edge.source, graphData, result, visited);
			}
		});
	};

	// Global mock data for prefill
	const globalData = [
		{
			id: "global.currentDate",
			label: "Current Date",
			description: "The current date",
		},
		{
			id: "global.currentUser",
			label: "Current User",
			description: "The currently logged in user",
		},
		{
			id: "global.journeyId",
			label: "Journey ID",
			description: "The ID of the current journey",
		},
		{
			id: "global.organizationName",
			label: "Organization Name",
			description: "Name of the organization",
		},
		{
			id: "global.organizationId",
			label: "Organization ID",
			description: "ID of the organization",
		},
	];

	const filterItems = (items: any[]) => {
		return items.filter(
			(item) =>
				item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.id.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	};

	const getFormFields = (form: Form) => {
		if (!form.field_schema || !form.field_schema.properties) return [];

		return Object.entries(form.field_schema.properties).map(([key, value]) => ({
			id: `${form.id}.${key}`,
			label: key,
			description: (value as any).title || key,
			type: (value as any).type || "string",
		}));
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle>
				<Box display="flex" justifyContent="space-between" alignItems="center">
					<Typography variant="h6">Select Mapping for "{fieldName}"</Typography>
					<IconButton
						edge="end"
						color="inherit"
						onClick={onClose}
						aria-label="close"
					>
						<CloseIcon />
					</IconButton>
				</Box>
			</DialogTitle>

			<DialogContent dividers>
				<TextField
					fullWidth
					placeholder="Search for fields..."
					variant="outlined"
					value={searchTerm}
					onChange={handleSearchChange}
					sx={{ mb: 2 }}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon />
							</InputAdornment>
						),
					}}
				/>

				<Tabs
					value={tabValue}
					onChange={handleTabChange}
					aria-label="mapping tabs"
				>
					<Tab label="Direct Dependencies" />
					<Tab label="Transitive Dependencies" />
					<Tab label="Global Data" />
				</Tabs>

				<TabPanel value={tabValue} index={0}>
					{directDependencies.length === 0 ? (
						<Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
							No direct dependencies found for this form.
						</Typography>
					) : (
						directDependencies.map((dependencyForm) => (
							<Accordion key={dependencyForm.id}>
								<AccordionSummary expandIcon={<ExpandMoreIcon />}>
									<Typography>{dependencyForm.name}</Typography>
								</AccordionSummary>
								<AccordionDetails>
									<List dense>
										{filterItems(getFormFields(dependencyForm)).map((field) => (
											<ListItem key={field.id} disablePadding>
												<ListItemButton
													onClick={() => handleSelectMapping(field.id)}
												>
													<ListItemText
														primary={field.label}
														secondary={`${field.type} - ${field.description}`}
													/>
												</ListItemButton>
											</ListItem>
										))}
									</List>
								</AccordionDetails>
							</Accordion>
						))
					)}
				</TabPanel>

				<TabPanel value={tabValue} index={1}>
					{transitiveDependencies.length === 0 ? (
						<Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
							No transitive dependencies found for this form.
						</Typography>
					) : (
						transitiveDependencies.map((dependencyForm) => (
							<Accordion key={dependencyForm.id}>
								<AccordionSummary expandIcon={<ExpandMoreIcon />}>
									<Typography>{dependencyForm.name}</Typography>
								</AccordionSummary>
								<AccordionDetails>
									<List dense>
										{filterItems(getFormFields(dependencyForm)).map((field) => (
											<ListItem key={field.id} disablePadding>
												<ListItemButton
													onClick={() => handleSelectMapping(field.id)}
												>
													<ListItemText
														primary={field.label}
														secondary={`${field.type} - ${field.description}`}
													/>
												</ListItemButton>
											</ListItem>
										))}
									</List>
								</AccordionDetails>
							</Accordion>
						))
					)}
				</TabPanel>

				<TabPanel value={tabValue} index={2}>
					<List dense>
						{filterItems(globalData).map((item) => (
							<ListItem key={item.id} disablePadding>
								<ListItemButton onClick={() => handleSelectMapping(item.id)}>
									<ListItemText
										primary={item.label}
										secondary={item.description}
									/>
								</ListItemButton>
							</ListItem>
						))}
					</List>
				</TabPanel>
			</DialogContent>

			<DialogActions>
				<Button onClick={onClose} color="inherit">
					Cancel
				</Button>
			</DialogActions>
		</Dialog>
	);
}
