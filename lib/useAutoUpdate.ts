import * as Updates from 'expo-updates';
import { useEffect } from 'react';

export function useAutoUpdate() {
  useEffect(() => {
    if (__DEV__) return;
    (async () => {
      try {
        const { isAvailable } = await Updates.checkForUpdateAsync();
        if (!isAvailable) return;
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      } catch {
        // silent — updates shouldn't block the app
      }
    })();
  }, []);
}
