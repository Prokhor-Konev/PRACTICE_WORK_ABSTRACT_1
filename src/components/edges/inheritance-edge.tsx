import React from 'react';

import { BaseEdge, EdgeProps, getSmoothStepPath, Position } from '@xyflow/react';

import s from './styles.module.scss';

export const InheritanceEdge: React.FC<EdgeProps> = ({
    id, selected,
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition
}) => {
    const [edgePath] = getSmoothStepPath({
        sourceX, sourceY, sourcePosition,
        targetX, targetY, targetPosition,
        borderRadius: 4, offset: 32
    });

    const SIZE = 16
    const points = Array(3).fill(0).map(() => ({ x: 0, y: 0 }));

    if ([Position.Left, Position.Right].includes(targetPosition)) {
        const sign = targetPosition === Position.Left ? -1 : 1;
        points[0] = { x: targetX, y: targetY };
        points[1] = { x: targetX + sign * SIZE, y: targetY + SIZE / 2 };
        points[2] = { x: targetX + sign * SIZE, y: targetY - SIZE / 2 };
    } else {
        const sign = targetPosition === Position.Top ? -1 : 1;
        points[0] = { x: targetX, y: targetY };
        points[1] = { x: targetX + SIZE / 2, y: targetY + sign * SIZE };
        points[2] = { x: targetX - SIZE / 2, y: targetY + sign * SIZE };
    }

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                className={`${s.edge} ${selected ? s.selected : ''}`}
            />
            <polygon
                points={points.map(p => `${p.x},${p.y}`).join(' ')}
                className={`${s['edge-end']} ${s['inheritance-triangle']} ${selected ? s.selected : ''}`}
            />
        </>
    );
};