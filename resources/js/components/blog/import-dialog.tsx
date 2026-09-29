import { Download, FileSpreadsheet, Upload } from 'lucide-react';
import PostController from '@/actions/App/Http/Controllers/Admin/PostController';
import { FormDialog } from '@/components/event/form-dialog';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import type { TranslationKey } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';

const COLUMNS: { name: string; hint: TranslationKey; required?: boolean }[] = [
    { name: 'title', hint: 'import.col_title', required: true },
    { name: 'body', hint: 'import.col_body', required: true },
    { name: 'slug', hint: 'import.col_slug' },
    { name: 'excerpt', hint: 'import.col_excerpt' },
    { name: 'locale', hint: 'import.col_locale' },
    { name: 'published', hint: 'import.col_published' },
    { name: 'published_at', hint: 'import.col_published_at' },
    { name: 'meta_title', hint: 'import.col_meta_title' },
    { name: 'meta_description', hint: 'import.col_meta_description' },
];

export function ImportPostsDialog() {
    const { t } = useTranslation();

    return (
        <FormDialog
            title={t('import.title')}
            form={PostController.import.form()}
            resetOnSuccess
            submitLabel={t('import.submit')}
            trigger={
                <Button variant="outline" className="rounded-full">
                    <FileSpreadsheet className="size-4" />
                    {t('import.button')}
                </Button>
            }
            footer={
                <Button
                    asChild
                    type="button"
                    variant="ghost"
                    className="rounded-full"
                >
                    <a href={PostController.importTemplate.url()} download>
                        <Download className="size-4" />
                        {t('import.template')}
                    </a>
                </Button>
            }
        >
            {(errors) => (
                <>
                    <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                        <li>{t('import.step1')}</li>
                        <li>{t('import.step2')}</li>
                        <li>{t('import.step3')}</li>
                    </ol>

                    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed p-6 text-center text-sm transition-colors hover:border-primary">
                        <Upload className="size-6 text-primary" />
                        <span className="font-medium">
                            {t('import.choose')}
                        </span>
                        <input
                            type="file"
                            name="csv"
                            accept=".csv,text/csv"
                            required
                            className="max-w-full text-xs text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-muted file:px-3 file:py-1"
                        />
                    </label>

                    {errors.csv && (
                        <div className="max-h-48 overflow-y-auto rounded-xl bg-red-50 p-3 dark:bg-red-950/40">
                            <InputError
                                message={errors.csv}
                                className="whitespace-pre-line"
                            />
                        </div>
                    )}

                    <details className="rounded-xl border text-sm">
                        <summary className="cursor-pointer px-3 py-2 font-medium">
                            {t('import.columns')}
                        </summary>
                        <dl className="divide-y border-t">
                            {COLUMNS.map((column) => (
                                <div
                                    key={column.name}
                                    className="grid grid-cols-[8.5rem_1fr] gap-2 px-3 py-2"
                                >
                                    <dt className="font-mono text-xs">
                                        {column.name}
                                        {column.required && (
                                            <span className="text-destructive">
                                                {' '}
                                                *
                                            </span>
                                        )}
                                    </dt>
                                    <dd className="text-xs text-muted-foreground">
                                        {t(column.hint)}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </details>
                </>
            )}
        </FormDialog>
    );
}
