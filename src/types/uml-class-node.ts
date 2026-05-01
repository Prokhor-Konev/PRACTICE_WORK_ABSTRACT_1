import { Node } from '@xyflow/react';

export type UMLField = {
    id: string;
    name: string;
    type?: string;
};

export type UMLClassNodeData = {
    name: string;
    attributes: UMLField[];
    methods: UMLField[];

    onChange: (data: UMLClassNodeData) => void;
    onDelete: () => void;
};

export type UMLClassNodeDTO = Node<UMLClassNodeData>;