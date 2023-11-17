declare module 'fitty' {
    export interface FittyOptions {
        minSize?: number;
        maxSize?: number;
        multiLine?: boolean;
        observeMutations?: MutationObserverInit;
    }

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

    function fitty(el: HTMLElement, options?: FittyOptions): FittyInstance;
    function fitty(el: string, options?: FittyOptions): FittyInstance[];

    declare namespace fitty {
        let observeWindow: boolean;
        let observeWindowDelay: number;
        const fitAll: (options?: FittyOptions) => void;
    }

    export default fitty;
}
