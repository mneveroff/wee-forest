/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_POSTHOG_PUBLIC_API_KEY?: string;
  readonly PUBLIC_POSTHOG_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  Plotly?: {
    newPlot: (...args: unknown[]) => void;
    Plots: { resize: (element: HTMLElement) => void };
  };
  posthog?: {
    capture: (event: string, properties?: Record<string, unknown>) => void;
    init: (token: string, options?: Record<string, unknown>) => void;
  };
}

declare namespace JSX {
  interface IntrinsicElements {
    'stripe-buy-button': {
      'buy-button-id': string;
      'publishable-key': string;
    };
  }
}
