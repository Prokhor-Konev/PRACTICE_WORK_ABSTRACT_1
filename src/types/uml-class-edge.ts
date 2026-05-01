import { Edge } from '@xyflow/react';

export type UMLEdgeType = 'association' | 'inheritance' | 'aggregation' | 'composition';

export type UMLClassEdgeData = {
    type: UMLEdgeType;
    label?: string;
};

export type UMLClassEdgeDTO = Edge<UMLClassEdgeData>;