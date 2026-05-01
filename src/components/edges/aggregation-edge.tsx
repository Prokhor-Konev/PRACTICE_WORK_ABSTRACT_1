import React from 'react';

import { BaseEdge, EdgeProps, getSmoothStepPath, Position } from '@xyflow/react';

import s from './styles.module.scss';

export const AggregationEdge: React.FC<EdgeProps> = ({
    id, selected,
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition
}) => {
    const [edgePath] = getSmoothStepPath({
        sourceX, sourceY, sourcePosition,
        targetX, targetY, targetPosition,
        borderRadius: 4, offset: 32,
    });

    const SIZE = 10;
    const points = Array(4).fill(0).map(() => ({ x: 0, y: 0 }));

    const camp = (num: number, min: number, max: number) => Math.max(min, Math.min(num, max));

    if ([Position.Left, Position.Right].includes(targetPosition)) {
        const sign = targetPosition === Position.Left ? -1 : 1;
        // Right
        points[1].x = targetX + camp(sign, 0, 1) * SIZE * 2;
        points[1].y = targetY;

        // Left
        points[3].x = targetX + camp(sign, -1, 0) * SIZE * 2;
        points[3].y = targetY;

        //Top
        points[0].x = targetX + sign * SIZE;
        points[0].y = targetY + SIZE / 2;

        //Bottom
        points[2].x = targetX + sign * SIZE;
        points[2].y = targetY - SIZE / 2;
    } else {
        const sign = targetPosition === Position.Top ? -1 : 1;
        // Right
        points[1].x = targetX + SIZE / 2;
        points[1].y = targetY + sign * SIZE;

        // Left
        points[3].x = targetX - SIZE / 2;
        points[3].y = targetY + sign * SIZE;

        //Top
        points[0].x = targetX;
        points[0].y = targetY + camp(sign, 0, 1) * SIZE * 2;

        //Bottom
        points[2].x = targetX;
        points[2].y = targetY + camp(sign, -1, 0) * SIZE * 2;
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
                className={`${s['edge-end']} ${s['aggregation-diamond']} ${selected ? s.selected : ''}`}
            />
        </>
    );
};