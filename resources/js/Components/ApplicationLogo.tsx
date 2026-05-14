import { SVGAttributes } from 'react';

export default function ApplicationLogo({ className }: { className?: string }) {
    return (
        <img 
            src="/assets/images/logotokoin.png" 
            alt="Logo Tokoin"
            className={className}
        />
    );
}