import { getSmoothStepPath, Position } from '@xyflow/react';

import { UMLClassEdgeDTO } from '../types/uml-class-edge';
import { UMLClassNodeDTO } from '../types/uml-class-node';

// ─── Стили ────────────────────────────────────────────────────────────────────

const COLORS = {
    black: '#212529',
    white: '#f7f9fa',
    headerBg: '#f7f9fa',
};

const FONT = {
    header: 'bold 20px Montserrat',
    body: '16px monospace',
    lineHeight: 18,
    headerHeight: 32,
    paddingX: 8,
    paddingY: 6,
};

const PADDING = 64;
const EDGE_WIDTH = 2;
const BORDER_RADIUS = 8;
const NODE_MIN_WIDTH = 180;

// ─── Вспомогательные геометрические функции ──────────────────────────────────

function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(v, max));
}

function roundedRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number
) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// ─── Измерение размера узла ───────────────────────────────────────────────────

function measureNodeSize(
    ctx: CanvasRenderingContext2D,
    node: UMLClassNodeDTO
): { width: number; height: number } {
    const { name, attributes, methods } = node.data;

    ctx.font = FONT.header;
    let maxW = ctx.measureText(name).width + FONT.paddingX * 2 + 32;

    ctx.font = FONT.body;
    const allFields = [
        ...attributes.map(f => (f.type?.trim() ? `+ ${f.name}: ${f.type.trim()}` : `+ ${f.name}`)),
        ...methods.map(f => `+ ${f.name}(): ${f.type?.trim() || 'void'}`),
    ];
    allFields.forEach(label => {
        const w = ctx.measureText(label).width + FONT.paddingX * 2;
        if (w > maxW) maxW = w;
    });

    const width = Math.max(NODE_MIN_WIDTH, Math.ceil(maxW));

    let height = FONT.headerHeight;
    const hasAttrs = attributes.length > 0;
    const hasMethods = methods.length > 0;
    if (!hasAttrs && !hasMethods) {
        height += FONT.lineHeight + FONT.paddingY * 2;
    } else {
        if (hasAttrs) height += attributes.length * FONT.lineHeight + FONT.paddingY * 2;
        if (hasMethods) height += methods.length * FONT.lineHeight + FONT.paddingY * 2;
    }

    return { width, height };
}

// ─── Рисование узла ──────────────────────────────────────────────────────────

function drawNode(
    ctx: CanvasRenderingContext2D,
    node: UMLClassNodeDTO,
    offsetX: number, offsetY: number,
    w: number, h: number
) {
    const { name, attributes, methods } = node.data;
    const x = node.position.x - offsetX + PADDING;
    const y = node.position.y - offsetY + PADDING;

    // Тень
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.13)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    roundedRect(ctx, x, y, w, h, BORDER_RADIUS);
    ctx.fillStyle = COLORS.white;
    ctx.fill();
    ctx.restore();

    // Основная граница
    roundedRect(ctx, x, y, w, h, BORDER_RADIUS);
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Заголовок: clip → заливка → текст
    ctx.save();
    roundedRect(ctx, x, y, w, h, BORDER_RADIUS);
    ctx.clip();

    ctx.fillStyle = COLORS.headerBg;
    ctx.fillRect(x, y, w, FONT.headerHeight);

    // разделитель заголовка
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + FONT.headerHeight);
    ctx.lineTo(x + w, y + FONT.headerHeight);
    ctx.stroke();

    ctx.restore();

    // Текст заголовка по центру
    ctx.font = FONT.header;
    ctx.fillStyle = COLORS.black;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, x + w / 2, y + FONT.headerHeight / 2);

    // Секции
    const hasAttrs = attributes.length > 0;
    const hasMethods = methods.length > 0;
    let curY = y + FONT.headerHeight;

    const drawSection = (items: typeof attributes, isMethod: boolean) => {
        const secH = items.length * FONT.lineHeight + FONT.paddingY * 2;

        ctx.strokeStyle = COLORS.black;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, curY);
        ctx.lineTo(x + w, curY);
        ctx.stroke();

        ctx.font = FONT.body;
        ctx.fillStyle = COLORS.black;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        items.forEach((f, i) => {
            const label = isMethod
                ? `+ ${f.name}(): ${f.type?.trim() || 'void'}`
                : (f.type?.trim() ? `+ ${f.name}: ${f.type.trim()}` : `+ ${f.name}`);
            ctx.fillText(label, x + FONT.paddingX, curY + FONT.paddingY + i * FONT.lineHeight);
        });

        curY += secH;
    };

    if (!hasAttrs && !hasMethods) {
        // пустая секция — просто разделитель
        ctx.strokeStyle = COLORS.black;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, curY);
        ctx.lineTo(x + w, curY);
        ctx.stroke();
    } else {
        if (hasAttrs) drawSection(attributes, false);
        if (hasMethods) drawSection(methods, true);
    }
}

// ─── Edge helpers ─────────────────────────────────────────────────────────────

function positionFromHandle(handle: string | null | undefined): Position {
    switch (handle) {
        case 'top':    return Position.Top;
        case 'bottom': return Position.Bottom;
        case 'left':   return Position.Left;
        case 'right':  return Position.Right;
        default:       return Position.Bottom;
    }
}

function getHandlePoint(
    node: UMLClassNodeDTO,
    pos: Position,
    offsetX: number, offsetY: number,
    w: number, h: number
): { x: number; y: number } {
    const nx = node.position.x - offsetX + PADDING;
    const ny = node.position.y - offsetY + PADDING;
    switch (pos) {
        case Position.Top:    return { x: nx + w / 2, y: ny };
        case Position.Bottom: return { x: nx + w / 2, y: ny + h };
        case Position.Left:   return { x: nx,         y: ny + h / 2 };
        case Position.Right:  return { x: nx + w,     y: ny + h / 2 };
    }
}

/**
 * Парсим SVG-path строку (M L C Q Z) и рисуем на Canvas.
 * getSmoothStepPath возвращает только эти команды.
 */
function strokeSvgPath(ctx: CanvasRenderingContext2D, d: string) {
    const tokens = d.match(/[MmLlCcQqZz][^MmLlCcQqZz]*/g) || [];
    ctx.beginPath();
    for (const token of tokens) {
        const type = token[0];
        const nums = token.slice(1).trim().split(/[\s,]+/).filter(Boolean).map(Number);
        switch (type) {
            case 'M': ctx.moveTo(nums[0], nums[1]); break;
            case 'L': ctx.lineTo(nums[0], nums[1]); break;
            case 'C': ctx.bezierCurveTo(nums[0], nums[1], nums[2], nums[3], nums[4], nums[5]); break;
            case 'Q': ctx.quadraticCurveTo(nums[0], nums[1], nums[2], nums[3]); break;
            case 'Z': ctx.closePath(); break;
        }
    }
    ctx.stroke();
}

function drawDiamond(
    ctx: CanvasRenderingContext2D,
    tx: number, ty: number, tPos: Position,
    fillColor: string
) {
    const SIZE = 10;
    const pts: Array<{ x: number; y: number }> = [
        { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 },
    ];

    if (tPos === Position.Left || tPos === Position.Right) {
        const sign = tPos === Position.Left ? -1 : 1;
        pts[0] = { x: tx + sign * SIZE,               y: ty + SIZE / 2 };
        pts[1] = { x: tx + clamp(sign, 0, 1) * SIZE * 2,  y: ty };
        pts[2] = { x: tx + sign * SIZE,               y: ty - SIZE / 2 };
        pts[3] = { x: tx + clamp(sign, -1, 0) * SIZE * 2, y: ty };
    } else {
        const sign = tPos === Position.Top ? -1 : 1;
        pts[0] = { x: tx,               y: ty + clamp(sign, 0, 1) * SIZE * 2 };
        pts[1] = { x: tx + SIZE / 2,   y: ty + sign * SIZE };
        pts[2] = { x: tx,               y: ty + clamp(sign, -1, 0) * SIZE * 2 };
        pts[3] = { x: tx - SIZE / 2,   y: ty + sign * SIZE };
    }

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = EDGE_WIDTH;
    ctx.stroke();
}

function drawTriangle(
    ctx: CanvasRenderingContext2D,
    tx: number, ty: number, tPos: Position
) {
    const SIZE = 16;
    const pts: Array<{ x: number; y: number }> = [];

    if (tPos === Position.Left || tPos === Position.Right) {
        const sign = tPos === Position.Left ? -1 : 1;
        pts.push({ x: tx, y: ty });
        pts.push({ x: tx + sign * SIZE, y: ty + SIZE / 2 });
        pts.push({ x: tx + sign * SIZE, y: ty - SIZE / 2 });
    } else {
        const sign = tPos === Position.Top ? -1 : 1;
        pts.push({ x: tx,              y: ty });
        pts.push({ x: tx + SIZE / 2,  y: ty + sign * SIZE });
        pts.push({ x: tx - SIZE / 2,  y: ty + sign * SIZE });
    }

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = COLORS.white;
    ctx.fill();
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = EDGE_WIDTH;
    ctx.stroke();
}

// ─── Публичный API ────────────────────────────────────────────────────────────

/**
 * Рисует диаграмму на offscreen Canvas и возвращает data URL (PNG).
 * Не трогает DOM React Flow вообще — использует только state-данные.
 */
export async function exportDiagramToPng(
    nodes: UMLClassNodeDTO[],
    edges: UMLClassEdgeDTO[],
): Promise<string | null> {
    if (nodes.length === 0) return null;

    // Измеряем размеры узлов на временном canvas
    const measureCanvas = document.createElement('canvas');
    const mCtx = measureCanvas.getContext('2d')!;
    const nodeSizes = new Map<string, { width: number; height: number }>();
    nodes.forEach(n => nodeSizes.set(n.id, measureNodeSize(mCtx, n)));

    // Вычисляем границы диаграммы
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(n => {
        const { width, height } = nodeSizes.get(n.id)!;
        minX = Math.min(minX, n.position.x);
        minY = Math.min(minY, n.position.y);
        maxX = Math.max(maxX, n.position.x + width);
        maxY = Math.max(maxY, n.position.y + height);
    });

    const canvasW = maxX - minX + PADDING * 2;
    const canvasH = maxY - minY + PADDING * 2;

    const canvas = document.createElement('canvas');
    const scale = (window.devicePixelRatio || 1) * 2;
    canvas.width  = canvasW  * scale;
    canvas.height = canvasH * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(scale, scale);

    // Белый фон
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(0, 0, canvasW, canvasH);

    // ── Рёбра ──
    edges.forEach(edge => {
        const srcNode = nodes.find(n => n.id === edge.source);
        const tgtNode = nodes.find(n => n.id === edge.target);
        if (!srcNode || !tgtNode) return;

        const ss = nodeSizes.get(srcNode.id)!;
        const ts = nodeSizes.get(tgtNode.id)!;

        const srcPos = positionFromHandle(edge.sourceHandle);
        const tgtPos = positionFromHandle(edge.targetHandle);

        const src = getHandlePoint(srcNode, srcPos, minX, minY, ss.width, ss.height);
        const tgt = getHandlePoint(tgtNode, tgtPos, minX, minY, ts.width, ts.height);

        const [pathD] = getSmoothStepPath({
            sourceX: src.x, sourceY: src.y, sourcePosition: srcPos,
            targetX: tgt.x, targetY: tgt.y, targetPosition: tgtPos,
            borderRadius: 4, offset: 32,
        });

        ctx.strokeStyle = COLORS.black;
        ctx.lineWidth = EDGE_WIDTH;
        ctx.setLineDash([]);
        strokeSvgPath(ctx, pathD);

        const type = edge.data?.type ?? edge.type;
        if (type === 'inheritance') {
            drawTriangle(ctx, tgt.x, tgt.y, tgtPos);
        } else if (type === 'aggregation') {
            drawDiamond(ctx, tgt.x, tgt.y, tgtPos, COLORS.white);
        } else if (type === 'composition') {
            drawDiamond(ctx, tgt.x, tgt.y, tgtPos, COLORS.black);
        }
    });

    nodes.forEach(n => {
        const { width, height } = nodeSizes.get(n.id)!;
        drawNode(ctx, n, minX, minY, width, height);
    });

    return canvas.toDataURL('image/png');
}
