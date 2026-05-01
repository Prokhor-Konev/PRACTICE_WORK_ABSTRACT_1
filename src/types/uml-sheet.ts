import { UMLClassEdgeDTO } from './uml-class-edge';
import { UMLClassNodeDTO } from './uml-class-node';

export type UMLSheetMetaDTO = {
    id: number;
    name: string;
    snapToGrid: boolean;
    moveLock: boolean;
    createdAt: string;
    updatedAt: string;
};

export type UMLSheetDTO = {
    meta: UMLSheetMetaDTO;
    nodes: UMLClassNodeDTO[];
    edges: UMLClassEdgeDTO[];
};