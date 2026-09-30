import { cn } from '@/lib/utils';

/**
 * The TheapKa Digital logo: the TK emblem and the wordmark, both cut from
 * the brand artwork. On dark backgrounds the navy lettering would vanish,
 * so there the wordmark is set in ivory and gold type instead.
 */
export default function AppLogo({
    className,
    size = 'md',
    onDark = false,
}: {
    className?: string;
    size?: 'md' | 'lg';
    /** On a navy panel, whatever the colour scheme. */
    onDark?: boolean;
}) {
    const lg = size === 'lg';

    return (
        <div
            className={cn('flex items-center gap-2 py-1 pr-2', className)}
            role="img"
            aria-label="TheapKa Digital"
        >
            <img
                src="/images/logo-mark.webp"
                alt=""
                width={lg ? 62 : 47}
                height={lg ? 48 : 36}
                className={cn(
                    'shrink-0 object-contain',
                    lg ? 'h-12 w-[62px]' : 'h-9 w-[47px]',
                )}
            />
            {!onDark && (
                <img
                    src="/images/logo-wordmark.webp"
                    alt=""
                    width={lg ? 114 : 94}
                    height={lg ? 40 : 33}
                    className={cn(
                        'shrink-0 object-contain dark:hidden',
                        lg ? 'h-10 w-[114px]' : 'h-[33px] w-[94px]',
                    )}
                />
            )}
            <span
                className={cn(
                    'flex-col leading-none',
                    onDark ? 'flex' : 'hidden dark:flex',
                )}
            >
                <span
                    className={cn(
                        'font-serif font-bold tracking-wide',
                        lg ? 'text-2xl' : 'text-xl',
                    )}
                >
                    <span className="text-navy-deep-foreground">Theap</span>
                    <span className="text-gold-foil">Ka</span>
                </span>
                <span className="mt-0.5 text-[9px] font-semibold tracking-[0.35em] text-gold">
                    DIGITAL
                </span>
            </span>
        </div>
    );
}
