import '@/global.css';

import { NAV_THEME, THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { useSettings, useUser } from '@/lib/hooks';
import * as Sentry from '@sentry/react-native';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const borderRadius = 10; // 0.625rem = 10px

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
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration({
      // Personnalisation des textes - Feedback orienté
      formTitle: "Partagez votre avis",
      submitButtonLabel: "Envoyer mon avis",
      cancelButtonLabel: "Annuler",
      nameLabel: "Nom",
      namePlaceholder: "Votre nom",
      emailLabel: "Email",
      emailPlaceholder: "votre.email@exemple.com",
      messageLabel: "Votre avis",
      messagePlaceholder: "Dites-nous ce que vous pensez de StockUp... Vos suggestions, vos impressions, tout est bienvenu !",
      successMessageText: "Merci pour votre retour ! Votre avis nous aide à améliorer StockUp.",
      errorTitle: "Erreur",
      formError: "Veuillez remplir tous les champs requis.",
      emailError: "Veuillez entrer une adresse email valide.",
      genericError: "Impossible d'envoyer votre avis. Veuillez réessayer plus tard.",
      
      // Options d'affichage
      showBranding: false, // Masquer le logo Sentry pour une expérience plus personnalisée
      showName: true,
      showEmail: true,
      isNameRequired: false,
      isEmailRequired: false,
      shouldValidateEmail: true,
      
      // Screenshots
      enableScreenshot: true,
      enableTakeScreenshot: false,
      addScreenshotButtonLabel: "Ajouter une capture d'écran",
      removeScreenshotButtonLabel: "Retirer la capture",
      onAddScreenshot: async (addScreenshot: (uri: string) => void) => {
        try {
          const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permissionResult.granted) {
            Alert.alert('Permission requise', 'Vous devez autoriser l\'accès à la galerie photo pour ajouter une capture.');
            return;
          }
          
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
          });
          
          if (!result.canceled && result.assets[0]) {
            addScreenshot(result.assets[0].uri);
          }
        } catch (error) {
          console.error('Erreur lors de la sélection d\'image:', error);
          Alert.alert('Erreur', 'Impossible d\'ajouter la capture d\'écran.');
        }
      },

      // Thème personnalisé - utilise le thème système
      colorScheme: "system",
      themeLight: {
        background: '#ffffff',      // card
        foreground: '#0a0a0a',      // cardForeground
        accentForeground: '#fafafa', // primaryForeground
        accentBackground: '#171717', // primary
        border: '#e5e5e5',          // border
        feedbackIcon: '#171717',     // primary
      },
      themeDark: {
        background: '#0a0a0a',       // card
        foreground: '#fafafa',        // cardForeground
        accentForeground: '#171717', // primaryForeground
        accentBackground: '#fafafa',  // primary
        border: '#262626',           // border
        feedbackIcon: '#fafafa',     // primary
      },
      
      // Styles personnalisés avec les couleurs du thème
      styles: {
        container: {
          padding: 30,
          borderRadius: borderRadius,
          backgroundColor: '#ffffff', // card light
        },
        title: {
          fontSize: 20,
          fontWeight: 'bold',
          color: '#0a0a0a', // cardForeground light
        },
        label: {
          fontSize: 14,
          fontWeight: '500',
          color: '#0a0a0a', // cardForeground light
        },
        input: {
          borderRadius: borderRadius - 2,
          borderWidth: 1,
          borderColor: '#e5e5e5', // border light
          backgroundColor: '#ffffff', // card light
          color: '#0a0a0a', // cardForeground light
          padding: 12,
          fontSize: 16,
        },
        textArea: {
          borderRadius: borderRadius - 2,
          borderWidth: 1,
          borderColor: '#e5e5e5', // border light
          backgroundColor: '#ffffff', // card light
          color: '#0a0a0a', // cardForeground light
          padding: 12,
          fontSize: 16,
          minHeight: 120,
        },
        submitButton: {
          borderRadius: borderRadius - 2,
          paddingVertical: 12,
          paddingHorizontal: 24,
          backgroundColor: '#171717', // primary light
        },
        submitText: {
          fontSize: 16,
          fontWeight: '600',
          color: '#fafafa', // primaryForeground light
        },
        cancelButton: {
          borderRadius: borderRadius - 2,
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderWidth: 1,
          borderColor: '#e5e5e5', // border light
          backgroundColor: '#ffffff', // card light
        },
        cancelText: {
          fontSize: 16,
          fontWeight: '500',
          color: '#0a0a0a', // cardForeground light
        },
        screenshotButton: {
          borderRadius: borderRadius - 2,
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderWidth: 1,
          borderColor: '#e5e5e5', // border light
          backgroundColor: '#ffffff', // card light
        },
        screenshotText: {
          fontSize: 14,
          fontWeight: '500',
          color: '#0a0a0a', // cardForeground light
        },
      },
      
      // Callbacks
      onFormOpen: () => {
        console.log("Formulaire de feedback ouvert");
      },
      onFormClose: () => {
        console.log("Formulaire de feedback fermé");
      },
      onSubmitSuccess: (data) => {
        console.log("Feedback envoyé avec succès:", data);
      },
      onSubmitError: (error) => {
        console.error("Erreur lors de l'envoi du feedback:", error);
        Sentry.captureException(error);
      },
    }),
  ],

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