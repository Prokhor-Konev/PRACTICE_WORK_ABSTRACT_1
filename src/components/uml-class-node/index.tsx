import { useEffect, useState } from 'react';

import { Popover } from '@components/popover';
import { ClassEditor } from '@components/uml-class-editor';
import { IconPencil } from '@tabler/icons-react';
import { UMLClassNodeData } from '@ts/uml-class-node';
import { Handle, Position } from '@xyflow/react';

import s from './styles.module.scss';

type Props = {
    data: UMLClassNodeData;
    isConnectable: boolean;
    selected: boolean;
};

export const UMLClassNode: React.FC<Props> = ({ data, isConnectable, selected }) => {
    const [hovered, setHovered] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) setHovered(false);
    }, [open]);

    const formatField = (f: { name: string; type?: string }, isMethod?: boolean) => {
        const type = f.type?.trim();
        if (isMethod) return `+ ${f.name}(): ${type || 'void'}`;
        return type
            ? `+ ${f.name}: ${type}`
            : `+ ${f.name}`;
    };

    return (
        <div
            className={`${s.node} ${hovered ? s.hovered : ''} ${selected ? s.selected : ''}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => !open && setHovered(false)}
        >
            <Handle
                type="source"
                position={Position.Top}
                className={s.handle}
                isConnectable={isConnectable}
                id="top"
            />

            <Handle
                type="source"
                position={Position.Bottom}
                className={s.handle}
                isConnectable={isConnectable}
                id="bottom"
            />

            <Handle
                type="source"
                position={Position.Right}
                className={s.handle}
                isConnectable={isConnectable}
                id="right"
            />

            <Handle
                type="source"
                position={Position.Left}
                className={s.handle}
                isConnectable={isConnectable}
                id="left"
            />

            <div className={s.header}>
                {data.name}

                {hovered && (
                    <Popover
                        open={open}
                        onOpenChange={setOpen}
                        trigger={
                            <IconPencil
                                size={16}
                                color={'var(--accent)'}
                                className={s['edit-icon']}
                            />
                        }
                    >
                        <ClassEditor
                            data={data}
                            onSave={(partial) => {
                                data.onChange({
                                    ...data,
                                    ...partial
                                });
                                setOpen(false);
                            }}
                        />
                    </Popover>
                )}
            </div>

            {!data.attributes.concat(data.methods).length && (
                <div className={s.section} />
            )}

            {data.attributes.length > 0 && (
                <div className={s.section}>
                    {data.attributes.map(attr => (
                        <div key={attr.id}>
                            {formatField(attr)}
                        </div>
                    ))}
                </div>
            )}

            {data.methods.length > 0 && (
                <div className={s.section}>
                    {data.methods.map(method => (
                        <div key={method.id}>
                            {formatField(method, true)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};