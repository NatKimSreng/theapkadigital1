import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n';

type Props = {
    url: string;
    trigger?: ReactNode;
};

export function ConfirmDelete({ url, trigger }: Props) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const destroy = () => {
        router.delete(url, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        aria-label={t('common.delete')}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>{t('common.confirm_delete')}</DialogTitle>
                <DialogDescription>
                    {t('common.confirm_delete_hint')}
                </DialogDescription>
                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">
                            {t('common.cancel')}
                        </Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        disabled={processing}
                        onClick={destroy}
                    >
                        {t('common.delete')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
