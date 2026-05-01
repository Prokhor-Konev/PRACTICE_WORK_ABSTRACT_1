import '@xyflow/react/dist/style.css';
import './react-flow.scss';

import React, { useCallback, useState } from 'react';
import { exportDiagramToPng } from '@utils/exportToPng';

import {
    AggregationEdge, AssociationEdge, CompositionEdge, InheritanceEdge
} from '@components/edges';
import { EditorToolbar } from '@components/editor-toolbar';
import { UMLClassNode } from '@components/uml-class-node';
import { UMLClassEdgeDTO, UMLEdgeType } from '@ts/uml-class-edge';
import { UMLClassNodeData, UMLClassNodeDTO } from '@ts/uml-class-node';
import { UMLSheetMetaDTO } from '@ts/uml-sheet';
import {
    addEdge, applyEdgeChanges, applyNodeChanges, Background, BackgroundVariant, Connection,
    ConnectionMode, Edge, EdgeChange, NodeChange, ReactFlow,
    useReactFlow
} from '@xyflow/react';

const nodeTypes = {
    UMLClass: UMLClassNode,
};

const edgeTypes = {
    association: AssociationEdge,
    inheritance: InheritanceEdge,
    aggregation: AggregationEdge,
    composition: CompositionEdge,
};

export const EditorPage: React.FC = () => {
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    const [nodes, setNodes] = useState<UMLClassNodeDTO[]>([]);
    const [edges, setEdges] = useState<UMLClassEdgeDTO[]>([]);
    const [lastNumber, setLastNumber] = useState(1);
    const [currentEdgeType, setCurrentEdgeType] = useState<UMLEdgeType>('association');
    const [sheetMeta, setSheetMeta] = useState<UMLSheetMetaDTO>({
        id: Date.now(),
        name: 'Новый лист',
        snapToGrid: false,
        moveLock: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    const isValidConnection = useCallback((connection: UMLClassEdgeDTO | Connection): boolean => {
        if (!connection.source || !connection.target) return false;
        if (connection.source === connection.target) return false;
        const existingEdge = edges.find(e => e.source === connection.source && e.target === connection.target);
        return !existingEdge;
    }, [edges]);

    const onConnect = useCallback((params: UMLClassEdgeDTO | Connection) => {
        if (!isValidConnection(params)) return;

        const newEdge: UMLClassEdgeDTO = {
            ...params,
            id: `edge-${Date.now()}`,
            type: currentEdgeType,
            data: { type: currentEdgeType }
        };
        setEdges((eds) => addEdge(newEdge, eds));
    }, [currentEdgeType, isValidConnection]);

    const onNodesChange = useCallback((changes: NodeChange<UMLClassNodeDTO>[]) => {
        setNodes(nds => applyNodeChanges(changes, nds))
    }, []);

    const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
        setEdges(eds => applyEdgeChanges(changes, eds) as UMLClassEdgeDTO[])
    }, []);

    const onEdgeDelete = useCallback((edgesToDelete: Edge[]) => {
        setEdges(eds => eds.filter(e => !edgesToDelete.find(del => del.id === e.id)));
    }, []);

    const addClass = () => {
        const nodeId = Date.now().toString();
        setNodes(p => [...p, {
            id: nodeId,
            position: { x: 100, y: 100 },
            type: 'UMLClass',
            data: {
                name: `Класс №${lastNumber}`,
                attributes: [],
                methods: [],
                onChange: newData => updateNode(nodeId, newData),
                onDelete: () => deleteNode(nodeId)
            }
        }]);
        setLastNumber(n => n + 1);
    };

    const handleSheetMetaChange = <K extends keyof UMLSheetMetaDTO>(
        key: K,
        value: UMLSheetMetaDTO[K]
    ) => {
        setSheetMeta((prev) => ({
            ...prev,
            [key]: value,
            updatedAt: new Date().toISOString(),
        }));
    };

    const updateNode = (nodeId: string, newData: UMLClassNodeData) => {
        setNodes(nds =>
            nds.map(node => {
                if (node.id !== nodeId) return node;
                return {
                    ...node,
                    data: {
                        ...newData
                    }
                };
            })
        );
    };

    const deleteNode = (nodeId: string) => {
        setNodes(nds => nds.filter(n => n.id !== nodeId));
        setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    };

    const handleZoomIn = useCallback(() => {
        zoomIn({ duration: 200 });
    }, [zoomIn]);

    const handleZoomOut = useCallback(() => {
        zoomOut({ duration: 200 });
    }, [zoomOut]);

    const handleFitView = useCallback(() => {
        fitView({
            padding: 0.2,
            duration: 300,
            maxZoom: 1.5
        });
    }, [fitView]);

    const handleExport = useCallback(async () => {
        if (nodes.length === 0) return;

        try {
            const dataUrl = await exportDiagramToPng(nodes, edges);

            if (!dataUrl) return;

            if (window.electron) {
                const savedPath = await window.electron.saveFile(`${sheetMeta.name}.png`, dataUrl);
                if (savedPath) console.log('Сохранено в:', savedPath);
            } else {
                const link = document.createElement('a');
                link.download = `${sheetMeta.name}.png`;
                link.href = dataUrl;
                link.click();
            }
        } catch (error) {
            console.error('Ошибка экспорта:', error);
        }
    }, [nodes, edges, sheetMeta.name]);

    return (
        <div style={{ width: '100%', height: '100vh', cursor: 'default' }}>
            <EditorToolbar
                data={sheetMeta}
                onChange={handleSheetMetaChange}
                onClassAdd={addClass}
                onFit={handleFitView}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onExport={handleExport}
                currentEdgeType={currentEdgeType}
                onEdgeTypeChange={setCurrentEdgeType}
            />
            <ReactFlow
                nodesDraggable={!sheetMeta.moveLock}
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onEdgesDelete={onEdgeDelete}
                isValidConnection={isValidConnection}
                snapToGrid={sheetMeta.snapToGrid}
                snapGrid={[20, 20]}
                fitView
                deleteKeyCode="Delete"
                connectionMode={ConnectionMode.Loose}
            >
                <Background variant={BackgroundVariant.Cross} />
            </ReactFlow>
        </div>
    );
};