import { useNodesState, Node as ReactFlowNode, Edge as ReactFlowEdge, useEdgesState, ReactFlow, Background, MiniMap, Controls, addEdge, OnConnect } from '@xyflow/react';
import React, { useCallback, useEffect, useState } from 'react'
import { Form, GraphResponse, Node, Edge } from '../types/api';
import FormNode from './FormNode';
import PrefillModal from './PrefillModal';
import { fetchGraphData } from '../service/api';
import '@xyflow/react/dist/style.css';
import { Box, Typography } from '@mui/material';

export default function JourneyGraph() {
    const [graphData, setGraphData] = useState<GraphResponse | null>(null);
    const [nodes, setNodes, onNodeChange] = useNodesState([]);
    const [edges, setEdges, onEdgeChange] = useEdgesState([]);
    const [selectedForm, setSelectedForm] = useState<Form | null>(null);
    const [selectedNode, setSelectedNode] = useState<ReactFlowNode | null>(null);
    const [prefillModalOpen, setPrefillModalOpen] = useState(false);
    const [prefillValues, setPrefillValues] = useState<Record<string, Record<string, any>>>({});

    const onNodeClick = useCallback((event: React.MouseEvent, node: ReactFlowNode) => {
        setSelectedNode(node);
        if (graphData) {
            const form = graphData.forms.find(form => form.id === node.data.component_id);
            setSelectedForm(form || null);
            setPrefillModalOpen(true);
        }
    }, [graphData]);

    const handleClosePrefillModal = () => {
        setPrefillModalOpen(false);
    };

    const handleSavePrefill = (values: Record<string, any>) => {
        if (selectedNode) {
            setPrefillValues({
                ...prefillValues,
                [selectedNode.id]: values
            });
        }
        setPrefillModalOpen(false);
    };

    const nodeTypes = {
        form: FormNode
    }
    const onConnect: OnConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    useEffect(() => {
        const loadGraphData = async () => {
            try {
                const data = await fetchGraphData();
                setGraphData(data as GraphResponse);

                // Create a forms map for easy lookup
                const formsMap: Record<string, Form> = {};
                data.forms.forEach((form: any) => {
                    formsMap[form.id] = form as Form;
                });

                // Transform Node API response to React Flow Node response
                const reactFlowNodes = data.nodes.map((node: Node) => ({
                    id: node.id,
                    type: node.type,
                    position: node.position,
                    data: {
                        ...node.data,
                        id: node.data.id,
                        formData: formsMap[node.data.component_id] || null
                    }
                }));

                // Transform API edge to ReactFlow Edge
                const reactFlowEdges = data.edges.map((edge: Edge, index: number) => ({
                    id: `e${index}`,
                    source: edge.source,
                    target: edge.target,
                    animated: false
                }));

                setNodes(reactFlowNodes as any);
                setEdges(reactFlowEdges as any);
            } catch (error) {
                console.error("Error loading graph data:", error);
            }
        }

        loadGraphData();
    }, []);


    return (
        <Box sx={{ height: '100vh', width: '100%' }}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h5">
                    {graphData?.blueprint_name || 'Journey'} Builder
                </Typography>
            </Box>

            <ReactFlow
                nodes={nodes}
                onNodesChange={onNodeChange}
                onNodeClick={onNodeClick}
                edges={edges}
                onEdgesChange={onEdgeChange}
                nodeTypes={nodeTypes}
                onConnect={onConnect}
                fitView
            >
                <Background gap={12} size={1} />
                <MiniMap />
                <Controls />
            </ReactFlow>

            {selectedNode && selectedForm && (
                <PrefillModal
                    open={prefillModalOpen}
                    onClose={handleClosePrefillModal}
                    onSave={handleSavePrefill}
                    form={selectedForm}
                    nodeId={selectedNode.id}
                    graphData={graphData}
                    initialValues={prefillValues[selectedNode.id] || {}}
                />
            )}
        </Box>
    );
}
