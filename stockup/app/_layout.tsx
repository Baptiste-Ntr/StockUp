import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { useSettings, useUser } from '@/lib/hooks';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
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
}
