import { Form } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n';
import type { RouteFormDefinition } from '@/wayfinder';

type Props = {
    title: string;
    trigger: ReactNode;
    form: RouteFormDefinition<'get' | 'post'>;
    children: (errors: Record<string, string>) => ReactNode;
    footer?: ReactNode;
    resetOnSuccess?: boolean;
    submitLabel?: string;
};

/**
 * A dialog wrapping an Inertia form; it closes itself once the server accepts the submission.
 */
export function FormDialog({
    title,
    trigger,
    form,
    children,
    footer,
    resetOnSuccess = false,
    submitLabel,
}: Props) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
                <DialogTitle>{title}</DialogTitle>
                <Form
                    {...form}
                    options={{ preserveScroll: true }}
                    resetOnSuccess={resetOnSuccess}
                    onSuccess={() => setOpen(false)}
                    className="space-y-4"
                >
                    {({ processing, errors }) => (
                        <>
                            {children(errors)}
                            <DialogFooter className="gap-2 sm:justify-between">
                                <div>{footer}</div>
                                <div className="flex justify-end gap-2">
                                    <DialogClose asChild>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={processing}>
                                        {submitLabel ?? t('common.save')}
                                    </Button>
                                </div>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
