import { HeartHandshake } from 'lucide-react';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2 py-1 pr-3 pl-1">
            <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.78_0.11_85)] to-primary text-primary-foreground shadow-sm ring-1 ring-primary/30">
                <HeartHandshake className="size-[18px]" />
            </div>
            <span className="font-serif text-xl font-semibold tracking-wide text-foreground">
                Theapka
            </span>
        </div>
    );
}
