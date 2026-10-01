"use client";

import { ReactNode } from "react";

interface ModalProps {
    title: string;
    subtitle?: string;
    icon: ReactNode;
    onClose: () => void;
    children: ReactNode;
    labelledBy?: string;
    iconContainerClassName?: string;
}

export function Modal({ title, subtitle, icon, onClose, children, labelledBy, iconContainerClassName = "bg-error/10" }: ModalProps) {
    const titleId = labelledBy ?? `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-title`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>
            <button
                type="button"
                aria-label="Close modal"
                className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative glass animate-in fade-in zoom-in-95 rounded-[var(--radius-lg)] p-6 shadow-lg w-full max-w-md">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${iconContainerClassName}`}>
                        {icon}
                    </div>
                    <div>
                        <h2 id={titleId} className="text-lg font-black text-text">{title}</h2>
                        {subtitle && <p className="text-xs text-text-secondary">{subtitle}</p>}
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}