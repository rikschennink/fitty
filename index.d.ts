declare module 'fitty' {
    export interface FittyOptions {
        minSize?: number;
        maxSize?: number;
        multiLine?: boolean;
        observeMutations?: MutationObserverInit;
    }

    function fitty(el: HTMLElement, options?: FittyOptions): FittyInstance;
    function fitty(el: string, options?: FittyOptions): FittyInstance[];
    export default fitty;

    export interface FitOptions {
        sync?: boolean;
    }

    export interface FittyInstance {
        element: HTMLElement;
        fit: (options?: FitOptions) => void;
        freeze: () => void;
        unfreeze: () => void;
        unsubscribe: () => void;
    }
}
