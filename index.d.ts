declare module 'fitty' {
  interface FittyOptions {
    minSize?: number
    maxSize?: number
    multiLine?: boolean
    observeMutations?: MutationObserverInit
  }

  function fitty (el: HTMLElement, options?: FittyOptions): FittyInstance
  function fitty (el: string, options?: FittyOptions): FittyInstance[]
  export default fitty

  export interface FittyInstance {
    element: HTMLElement
    fit: () => void
    freeze: () => void
    unfreeze: () => void
    unsubscribe: () => void
  }
}
