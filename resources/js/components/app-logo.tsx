import { HeartHandshake } from 'lucide-react';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2 rounded-full bg-rose-50 py-1 pr-3 pl-1.5 dark:bg-rose-950/40">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <HeartHandshake className="size-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-primary">
                Theapka
            </span>
        </div>
    );
}
