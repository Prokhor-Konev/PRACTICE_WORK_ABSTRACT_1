import React, { useState } from 'react';
import s from './styles.module.scss';

type Variant = 'primary' | 'secondary' | 'danger';

type Props = {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: Variant;
    disabled?: boolean;
    icon?: (hovered: boolean) => React.ReactNode;
    iconAlign?: 'left' | 'right';
};

export const Button: React.FC<Props> = ({
    children,
    onClick,
    variant = 'primary',
    disabled,
    icon,
    iconAlign = 'left',
}) => {
    const [hovered, setHovered] = useState(false);

    return (
        <button
            disabled={disabled}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`${s.button} ${s[variant]} ${
                disabled ? s.disabled : ''
            }`}
        >
            {icon && iconAlign === 'left' && icon(hovered)}
            <span className={s.text}>{children}</span>
            {icon && iconAlign === 'right' && icon(hovered)}
        </button>
    );
};