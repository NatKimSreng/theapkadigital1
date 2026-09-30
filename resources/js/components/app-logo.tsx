import { cn } from '@/lib/utils';

/**
 * The TK emblem with the TheapKa Digital wordmark.
 */
export default function AppLogo({
    className,
    size = 'md',
    onDark = false,
}: {
    className?: string;
    size?: 'md' | 'lg';
    /** On a navy panel: the navy part of the wordmark turns ivory. */
    onDark?: boolean;
}) {
    return (
        <div className={cn('flex items-center gap-2 py-1 pr-2', className)}>
            <img
                src="/images/logo-mark.webp"
                alt=""
                width={size === 'lg' ? 56 : 44}
                height={size === 'lg' ? 40 : 31}
                className={cn(
                    'shrink-0 object-contain drop-shadow-sm',
                    size === 'lg' ? 'h-10 w-14' : 'h-8 w-11',
                )}
            />
            <span className="flex flex-col leading-none">
                <span
                    className={cn(
                        'font-serif font-bold tracking-wide',
                        size === 'lg' ? 'text-2xl' : 'text-xl',
                    )}
                >
                    <span
                        className={
                            onDark
                                ? 'text-navy-deep-foreground'
                                : 'text-navy-enamel'
                        }
                    >
                        Theap
                    </span>
                    <span className="text-gold-foil">Ka</span>
                </span>
                <span className="mt-0.5 text-[9px] font-semibold tracking-[0.35em] text-gold">
                    DIGITAL
                </span>
            </span>
        </div>
    );
}
