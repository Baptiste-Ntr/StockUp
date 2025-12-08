import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { useSettings, useUser } from '@/lib/hooks';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://f48af08d61a97fce661c74e34fefe5d1@o4510501265408000.ingest.de.sentry.io/4510501267898448',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default Sentry.wrap(function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const { user, loading: userLoading } = useUser();
  const { settings, loading: settingsLoading } = useSettings();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (userLoading) return;

    const inOnboarding = segments[0] === '(onboarding)';
    const inTabs = segments[0] === '(tabs)';

    // Si pas d'utilisateur et pas en onboarding, rediriger vers onboarding
    if (!user && !inOnboarding) {
      router.replace('/(onboarding)/welcome');
    }

    // Si utilisateur existe et en onboarding, rediriger vers tabs
    if (user && inOnboarding) {
      router.replace('/(tabs)');
    }

    // Si utilisateur existe et pas en tabs ni en modal, rediriger vers tabs
    if (user && !inTabs && !inOnboarding && segments[0] !== 'add-product' && segments[0] !== 'add-sale' && segments[0] !== 'manage-categories') {
      router.replace('/(tabs)');
    }
  }, [user, userLoading, segments]);

  useEffect(() => {
    if (settingsLoading) return;
    // Initialise le thème avec la préférence stockée uniquement si aucun thème n'est encore appliqué
    if (!colorScheme && settings?.theme && setColorScheme) {
      setColorScheme(settings.theme);
    }
  }, [settings?.theme, settingsLoading, setColorScheme, colorScheme]);

  if (userLoading || settingsLoading) {
    return null;
  }

  const effectiveTheme = colorScheme ?? settings?.theme ?? 'light';

  return (
    <ThemeProvider value={NAV_THEME[effectiveTheme]}>
      <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="add-product"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Ajouter un produit',
          }}
        />
        <Stack.Screen
          name="add-sale"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Enregistrer une vente',
          }}
        />
        <Stack.Screen
          name="manage-categories"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Gérer les catégories',
          }}
        />
      </Stack>
      <PortalHost />
    </ThemeProvider>
  );
});