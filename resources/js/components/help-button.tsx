import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n';

export function HelpButton() {
    const { t } = useTranslation();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="fixed right-5 bottom-5 z-40 h-11 rounded-full px-5 text-base shadow-lg shadow-primary/25">
                    <MessageCircle className="size-5" />
                    {t('help.button')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>{t('help.title')}</DialogTitle>
                <DialogDescription className="leading-relaxed">
                    {t('help.body')}
                </DialogDescription>
                <Button asChild variant="outline" className="w-fit">
                    <a
                        href="https://t.me/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Send className="size-4" />
                        {t('help.contact')}
                    </a>
                </Button>
            </DialogContent>
        </Dialog>
    );
}
