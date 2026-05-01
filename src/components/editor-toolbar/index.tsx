import React, { useState } from 'react';

import { Button } from '@components/button';
import { Input } from '@components/input';
import {
    IconArrowsCross, IconArrowsJoin, IconArrowsJoin2, IconArrowsSplit, IconFileTypePng, IconLock,
    IconLockOpen, IconMaximize, IconSquarePlus, IconZoomIn, IconZoomOut
} from '@tabler/icons-react';
import { UMLClassEdgeData, UMLEdgeType } from '@ts/uml-class-edge';
import { UMLSheetMetaDTO } from '@ts/uml-sheet';

import s from './styles.module.scss';

type Props = {
    data: UMLSheetMetaDTO;
    onChange: <K extends keyof UMLSheetMetaDTO>(
        param: K,
        value: UMLSheetMetaDTO[K]
    ) => void;
    onExport: () => void;
    onFit: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onClassAdd: () => void;
    currentEdgeType: UMLEdgeType;
    onEdgeTypeChange: (type: UMLEdgeType) => void;
};

const edgeTypeOptions: Array<{ value: UMLClassEdgeData['type']; label: string; icon: React.ReactNode }> = [
    { value: 'association', label: 'Ассоциация', icon: <IconArrowsJoin size={16} /> },
    { value: 'inheritance', label: 'Наследование', icon: <IconArrowsSplit size={16} /> },
    { value: 'aggregation', label: 'Агрегация', icon: <IconArrowsJoin2 size={16} /> },
    { value: 'composition', label: 'Композиция', icon: <IconArrowsCross size={16} /> },
];

export const EditorToolbar: React.FC<Props> = ({
    data,
    onChange,
    onFit,
    onZoomIn,
    onZoomOut,
    onExport,
    onClassAdd,
    currentEdgeType,
    onEdgeTypeChange
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localName, setLocalName] = useState(data.name);

    const handleBlur = () => {
        setIsEditing(false);
        if (localName.trim()) {
            onChange('name', localName);
        }
    };

    return (
        <div className={s.container}>
            <div className={s.left}>
                {isEditing ? (
                    <Input
                        value={localName}
                        onChange={setLocalName}
                        autoFocus
                        onBlur={handleBlur}
                    />
                ) : (
                    <div
                        className={s.title}
                        onDoubleClick={() => setIsEditing(true)}
                    >
                        {data.name}
                    </div>
                )}
            </div>

            <div className={s.center}>
                <div className={s['edge-type-selector']}>
                    {edgeTypeOptions.map(option => (
                        <div
                            key={option.value}
                            className={`${s['edge-type-option']} ${currentEdgeType === option.value ? s.active : ''}`}
                            onClick={() => onEdgeTypeChange(option.value)}
                            title={option.label}
                        >
                            {option.icon}
                        </div>
                    ))}
                </div>

                <div className={s.divider} />

                <div className={s['toolbar-item']} onClick={onZoomIn}>
                    <IconZoomIn
                        color='var(--black)'
                        size={16}
                        className={s['toolbar-icon']}
                    />
                </div>

                <div className={s['toolbar-item']} onClick={onZoomOut}>
                    <IconZoomOut
                        color='var(--black)'
                        size={16}
                        className={s['toolbar-icon']}
                    />
                </div>

                <div className={s['toolbar-item']} onClick={onFit}>
                    <IconMaximize
                        color='var(--black)'
                        size={16}
                        className={s['toolbar-icon']}
                    />
                </div>

                <div className={s['toolbar-item']} onClick={() => onChange('moveLock', !data.moveLock)}>
                    {data.moveLock
                        ? <IconLock
                            color='var(--black)'
                            size={16}
                            className={s['toolbar-icon']}
                        />
                        : <IconLockOpen
                            color='var(--black)'
                            size={16}
                            className={s['toolbar-icon']}
                        />
                    }
                </div>

                <div className={s.checkbox}>
                    <Input
                        type='checkbox'
                        value={data.snapToGrid}
                        onChange={v => onChange('snapToGrid', v)}
                    >
                        Сетка
                    </Input>
                </div>
            </div>

            <div className={s.right}>
                <div className={s['toolbar-item']} onClick={onClassAdd}>
                    <Button
                        iconAlign='left'
                        variant='secondary'
                        icon={() => (
                            <IconSquarePlus
                                className={s['toolbar-icon']}
                                color='var(--black)'
                                size={24}
                            />
                        )}
                    >
                        Добавить класс
                    </Button>
                </div>

                <div className={s['toolbar-item']} onClick={onExport}>
                    <IconFileTypePng
                        color='var(--black)'
                        size={16}
                        className={s['toolbar-icon']}
                    />
                </div>
            </div>
        </div>
    );
};