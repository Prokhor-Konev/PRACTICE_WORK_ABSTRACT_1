import React from 'react';

import { BaseEdge, EdgeProps, getSmoothStepPath } from '@xyflow/react';

import s from './styles.module.scss';

export const AssociationEdge: React.FC<EdgeProps> = ({
    id, selected,
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition
}) => {
    const [edgePath] = getSmoothStepPath({
        sourceX, sourceY, sourcePosition,
        targetX, targetY, targetPosition,
        borderRadius: 4, offset: 32
    });

    return (
        <BaseEdge
            id={id}
            path={edgePath}
            className={`${s.edge} ${s.association} ${selected ? s.selected : ''}`}
        />
    );
};