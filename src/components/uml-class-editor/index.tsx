import React, { useMemo, useState } from 'react';

import { Button } from '@components/button';
import { Input } from '@components/input';
import { IconTrash, IconX } from '@tabler/icons-react';
import { UMLClassNodeData, UMLField } from '@ts/uml-class-node';

import s from './styles.module.scss';

type Props = {
    data: UMLClassNodeData;
    onSave: (data: UMLClassNodeData) => void;
};

const createField = (): UMLField => ({
    id: Date.now().toString(),
    name: '',
    type: '',
});

export const ClassEditor: React.FC<Props> = ({ data, onSave }) => {
    //#region States 
    const [name, setName] = useState(data.name);
    const [attributes, setAttributes] = useState(data.attributes);
    const [methods, setMethods] = useState(data.methods);
    //#endregion

    //#region Helpers 
    const normalize = (list: UMLField[]) => {
        return list.filter(f => f.name.trim())
            .map(f => ({ ...f, type: f.type?.trim() || undefined, }));
    }

    const validateField = (f: UMLField) => f.name.trim() && /^[^\s]+$/.test(f.name);
    //#endregion

    //#region Computed values
    const isValid = useMemo(() => {
        return (
            name.trim() &&
            attributes.every(validateField) &&
            methods.every(validateField)
        );
    }, [name, attributes, methods]);
    //#endregion

    //#region Field controls
    const updateField = (
        list: UMLField[],
        setList: (v: UMLField[]) => void,
        id: string,
        key: keyof UMLField,
        value: string
    ) => {
        setList(list.map(f => f.id === id ? { ...f, [key]: value } : f));
    };

    const removeField = (list: UMLField[], setList: any, id: string) => setList(list.filter(f => f.id !== id));
    //#endregion

    return (
        <div className={s.container}>
            <div className={s.header}>
                <div className={s['header-title']}>Редактирование</div>
                <div className={s['header-actions']}>
                    <IconX
                        className={s['close-icon']}
                        style={{ minWidth: 16, cursor: 'pointer' }}
                        color='var(--black)'
                        size={16}
                        onClick={() => onSave(data)}
                    />
                </div>
            </div>

            <div className={s.section}>
                <div className={s['section-content']}>
                    <Input
                        value={name}
                        onChange={setName}
                        label="Название класса"
                        required
                        error={!name.trim() ? 'Обязательное поле' : ''}
                    />
                </div>
            </div>

            <div className={s.section}>
                <div className={s['section-title']}>Атрибуты:</div>
                <div className={s['section-content']}>
                    {attributes.map(attr => (
                        <div key={attr.id} className={s.row}>
                            <Input
                                value={attr.name}
                                onChange={v => updateField(attributes, setAttributes, attr.id, 'name', v)}
                                label="Название"
                                placeholder='name'
                                required
                                error={!attr.name.trim()
                                    ? 'Обязательное поле'
                                    : !/^[^\s]+$/.test(attr.name)
                                        ? 'Без пробелов'
                                        : undefined
                                }
                            />
                            <Input
                                value={attr.type || ''}
                                onChange={v => updateField(attributes, setAttributes, attr.id, 'type', v)}
                                label="Тип"
                                placeholder='string'
                            />
                            <IconTrash
                                style={{ minWidth: 16, cursor: 'pointer' }}
                                size={16}
                                color={'var(--red)'}
                                onClick={() => removeField(attributes, setAttributes, attr.id)}
                            />
                        </div>
                    ))}

                    <Button
                        variant="secondary"
                        onClick={() => setAttributes([...attributes, createField()])}
                    >
                        + Атрибут
                    </Button>
                </div>
            </div>

            <div className={s.section}>
                <div className={s['section-title']}>Методы:</div>
                <div className={s['section-content']}>
                    {methods.map(method => (
                        <div key={method.id} className={s.row}>
                            <Input
                                value={method.name}
                                onChange={v => updateField(methods, setMethods, method.id, 'name', v)}
                                label="Название"
                                placeholder='login'
                                required
                                error={!method.name.trim()
                                    ? 'Обязательное поле'
                                    : !/^[^\s]+$/.test(method.name)
                                        ? 'Без пробелов'
                                        : undefined
                                }
                            />
                            <Input
                                value={method.type || ''}
                                onChange={v => updateField(methods, setMethods, method.id, 'type', v)}
                                label="Тип"
                                placeholder='void'
                            />
                            <IconTrash
                                style={{ minWidth: 16, cursor: 'pointer' }}
                                color='var(--red)'
                                size={16}
                                onClick={() => removeField(methods, setMethods, method.id)}
                            />
                        </div>
                    ))}

                    <Button
                        variant="secondary"
                        onClick={() => setMethods([...methods, createField()])}
                    >
                        + Метод
                    </Button>
                </div>
            </div>

            <div className={s.actions}>
                <Button
                    disabled={!isValid}
                    onClick={() => onSave({
                        ...data,
                        name,
                        attributes: normalize(attributes),
                        methods: normalize(methods),
                    })}
                >
                    Сохранить
                </Button>

                <Button
                    variant="danger"
                    onClick={data.onDelete}
                    icon={hovered => (
                        <IconTrash
                            style={{ minWidth: 16, cursor: 'pointer', transition: '.2s linear all' }}
                            size={16}
                            color={`var(--${hovered ? 'red' : 'black'})`}
                        />
                    )}
                >
                    Удалить
                </Button>
            </div>
        </div>
    );
};