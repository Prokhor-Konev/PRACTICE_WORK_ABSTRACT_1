import * as PopoverPrimitive from '@radix-ui/react-popover';
import s from './styles.module.scss';
import React from 'react';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger: React.ReactNode;
    children: React.ReactNode;
};

export const Popover: React.FC<Props> = ({
    open,
    onOpenChange,
    trigger,
    children,
}) => {
    return (
        <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <PopoverPrimitive.Trigger asChild>
                {trigger}
            </PopoverPrimitive.Trigger>

            <PopoverPrimitive.Portal>
                <PopoverPrimitive.Content
                    side="right"
                    align="center"
                    sideOffset={24}
                    className={s.content}
                >
                    {children}
                </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
    );
}