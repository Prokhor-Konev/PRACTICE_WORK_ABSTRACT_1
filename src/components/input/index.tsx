import React from 'react';

import s from './styles.module.scss';

type BaseProps = {
    label?: string;
    required?: boolean;
    error?: string;
};

type TextInputProps = BaseProps & {
    type?: 'text';
    value: string;
    onChange: (v: string) => void;
    autoFocus?: boolean;
    onBlur?: () => void;
    onFocus?: () => void;
    placeholder?: string;
};

type CheckboxProps = {
    type: 'checkbox';
    value: boolean;
    onChange: (v: boolean) => void;
    children?: React.ReactNode;
};

type Props = TextInputProps | CheckboxProps;

export const Input: React.FC<Props> = (props) => {
    if (props.type === 'checkbox') {
        return (
            <label className={s.checkbox}>
                <input
                    type="checkbox"
                    checked={props.value}
                    onChange={(e) => props.onChange(e.target.checked)}
                />
                <span className={s.label}>{props.children}</span>
            </label>
        );
    }

    const { label, required, error } = props;

    return (
        <div className={s.wrapper}>
            <input
                autoFocus={props.autoFocus}
                className={`${s.input} ${error ? s.invalid : ''}`}
                value={props.value}
                placeholder={props.placeholder}
                onChange={(e) => props.onChange(e.target.value)}
                onBlur={props.onBlur}
                onFocus={props.onFocus}
            />

            {(label || error) && (
                <div className={`${s.label} ${required ? s.required : ''} ${error ? s.error : ''}`}>
                    {error || label}
                </div>
            )}
        </div>
    );
};