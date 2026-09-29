export type FlashToast = {
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
    params?: Record<string, string | number>;
};
