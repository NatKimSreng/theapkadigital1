import { useId } from 'react';
import type { Ornament as OrnamentType } from './templates';

type Props = {
    type: OrnamentType;
    primary: string;
    secondary: string;
    className?: string;
};

export function Ornament({ type, primary, secondary, className }: Props) {
    const id = `orn-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
    const fill = `url(#${id})`;

    return (
        <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
            <defs>
                <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fff8e1" />
                    <stop offset="45%" stopColor={primary} />
                    <stop offset="100%" stopColor={secondary} />
                </linearGradient>
            </defs>

            {type === 'rings' && (
                <g fill="none" stroke={fill}>
                    <circle cx="118" cy="82" r="52" strokeWidth="11" />
                    <circle cx="78" cy="128" r="40" strokeWidth="9" />
                    <path
                        d="M150 28l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"
                        fill={fill}
                        stroke="none"
                    />
                </g>
            )}

            {type === 'frame' && (
                <g fill="none" stroke={fill} strokeWidth="3">
                    <path d="M100 20c18 26 18 50 0 76-18-26-18-50 0-76z" />
                    <path d="M100 96c-24-8-44-28-52-56 28 6 46 24 52 56z" />
                    <path d="M100 96c24-8 44-28 52-56-28 6-46 24-52 56z" />
                    <path d="M100 96c-30 4-56-4-76-24 30-6 56 2 76 24z" />
                    <path d="M100 96c30 4 56-4 76-24-30-6-56 2-76 24z" />
                    <path d="M40 120h120" />
                    <path d="M60 134h80" />
                    <circle cx="100" cy="160" r="14" />
                    <circle cx="100" cy="160" r="5" fill={fill} />
                </g>
            )}

            {type === 'balloons' && (
                <g>
                    <path
                        d="M70 110c-8 20 6 40-4 70M120 100c6 24-6 46 2 80M152 120c-6 20 4 38-6 60"
                        fill="none"
                        stroke={secondary}
                        strokeWidth="2"
                    />
                    <ellipse cx="70" cy="70" rx="30" ry="38" fill={primary} />
                    <ellipse cx="120" cy="58" rx="34" ry="42" fill={fill} />
                    <ellipse
                        cx="152"
                        cy="90"
                        rx="24"
                        ry="30"
                        fill={secondary}
                    />
                    <ellipse
                        cx="60"
                        cy="56"
                        rx="7"
                        ry="12"
                        fill="#fff"
                        opacity="0.5"
                    />
                    <ellipse
                        cx="108"
                        cy="40"
                        rx="8"
                        ry="13"
                        fill="#fff"
                        opacity="0.5"
                    />
                </g>
            )}

            {type === 'house' && (
                <g
                    fill="none"
                    stroke={fill}
                    strokeWidth="5"
                    strokeLinejoin="round"
                >
                    <path d="M28 96L100 36l72 60" />
                    <path d="M46 84v84h108V84" />
                    <path d="M86 168v-44h28v44" />
                    <rect x="60" y="100" width="18" height="18" />
                    <rect x="122" y="100" width="18" height="18" />
                    <path d="M136 58V38h14v32" />
                    <path d="M20 168h160" />
                </g>
            )}

            {type === 'hearts' && (
                <g>
                    <path
                        d="M82 168S26 128 26 88c0-22 16-36 34-36 12 0 20 6 22 14 2-8 10-14 22-14 18 0 34 14 34 36 0 40-56 80-56 80z"
                        fill={fill}
                    />
                    <path
                        d="M128 148s-40-28-40-58c0-16 12-26 24-26 9 0 15 5 16 11 1-6 7-11 16-11 12 0 24 10 24 26 0 30-40 58-40 58z"
                        fill="none"
                        stroke={secondary}
                        strokeWidth="5"
                    />
                </g>
            )}
        </svg>
    );
}
