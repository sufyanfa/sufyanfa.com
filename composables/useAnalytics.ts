type EventData = Record<string, string | number | boolean>;

export function useAnalytics() {
  const track = (name: string, data?: EventData) => {
    if (import.meta.client) (window as any).umami?.track(name, data);
  };

  return { track };
}
