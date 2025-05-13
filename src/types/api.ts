export interface Position {
	x: number;
	y: number;
}

export interface InputMappingItem {
	component_key: string;
	is_metadata: boolean;
	output_key: string;
	type: string;
}

export interface TimeConfig {
	number: number;
	unit: string;
}

export interface AssignConfig {
	form_field: string;
	form_key: string;
	type: string;
	value: string;
}

export interface StateTransitionRules {
	state_transition_rules_if: InputMappingItem;
	state_transition_rules_then: string;
}

export interface NodeData {
	approval_auto_assign_config?: AssignConfig;
	approval_required: boolean;
	approval_roles: string[];
	approval_scheduled_delay?: TimeConfig;
	approval_sla_duration?: TimeConfig;
	approval_task_name?: string;
	auto_assign_config?: AssignConfig;
	component_id: string;
	component_key: string;
	component_type: string;
	data_promotion_config?: Record<string, string>;
	id: string;
	input_mapping: Record<string, any>;
	name: string;
	permitted_roles: string[];
	prerequisites: string[];
	scheduled_delay?: TimeConfig;
	sla_duration?: TimeConfig;
	state_transition_rules?: StateTransitionRules;
	[key: string]: any;
}

export interface Node {
	id: string;
	type: string;
	position: Position;
	data: NodeData;
}

export interface Edge {
	source: string;
	target: string;
}

export interface PayloadField {
	type: string;
	value: string;
}

// Updated to match the actual structure in your data
export interface DynamicFieldConfig {
	selector_field: string;
	payload_fields: Record<string, PayloadField>;
	endpoint_id: string;
}

export interface Form {
	$schema?: string;
	created_at?: string;
	created_by?: string;
	custom_javascript?: string;
	custom_javascript_triggering_fields?: string[];
	description: string;
	dynamic_field_config?: Record<string, DynamicFieldConfig>;
	field_schema: {
		type: string;
		properties: Record<string, any>;
		required: string[];
	};
	id: string;
	is_reusable: boolean;
	name: string;
	ui_schema: {
		elements: any[];
		type: string;
	};
	updated_at?: string;
	vendor_schema?: Record<string, any>;
	[key: string]: any;
}

export interface Condition {
	left: {
		object: string;
		property: string;
		type: string;
	};
	operator: string;
	right: {
		type: string;
		value: any;
	};
	type: string;
}

export interface Branch {
	$schema: string;
	condition: Condition;
	created_at: string;
	created_by: string;
	description: string;
	id: string;
	name: string;
	tenant_id: string;
	updated_at: string;
}

export interface TriggerEndpoint {
	$schema: string;
	created_at: string;
	id: string;
	max_retries: number;
	name: string;
	output_mapping: Record<string, string>;
	path_template: string;
	path_template_variables: string[];
	payload_template: Record<string, string>;
	payload_template_variables: string[];
	query_parameter_template: Record<string, string>;
	query_parameter_template_variables: string[];
	request_method: string;
	timeout_seconds: number;
	trigger_service_id: string;
	updated_at: string;
}

export interface GraphResponse {
	$schema?: string;
	id?: string;
	blueprint_id?: string;
	tenant_id?: string;
	name?: string;
	blueprint_name?: string;
	description?: string;
	category?: string;
	nodes: Node[];
	edges: Edge[];
	forms: Form[];
	branches: any[];
	triggers: any[];
	[key: string]: any;
}
