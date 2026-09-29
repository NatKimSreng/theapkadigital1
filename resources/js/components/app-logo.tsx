import { cn } from '@/lib/utils';

/**
 * The TK emblem with the TheapKa Digital wordmark.
 */
export default function AppLogo({
    className,
    size = 'md',
}: {
    className?: string;
    size?: 'md' | 'lg';
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
                    TheapKa
                </span>
                <span className="mt-0.5 text-[9px] font-semibold tracking-[0.35em] text-primary">
                    DIGITAL
                </span>
            </span>
        </div>
    );
}
