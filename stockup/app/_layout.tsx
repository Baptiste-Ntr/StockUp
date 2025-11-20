import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { useUser } from '@/lib/hooks';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const { user, loading } = useUser();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

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
  }, [user, loading, segments]);

  if (loading) {
    return null;
  }

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
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
