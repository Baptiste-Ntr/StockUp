import { Tabs } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { LayoutDashboardIcon, PackageIcon, ReceiptIcon, BarChart3Icon, SettingsIcon } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF', // Gris qui fonctionne sur fond clair et sombre
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: 28,
          height: 120,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Icon as={LayoutDashboardIcon} size={size} style={{ color }} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventaire',
          tabBarIcon: ({ color, size }) => (
            <Icon as={PackageIcon} size={size} style={{ color }} />
          ),
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: 'Ventes',
          tabBarIcon: ({ color, size }) => (
            <Icon as={ReceiptIcon} size={size} style={{ color }} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <Icon as={BarChart3Icon} size={size} style={{ color }} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Paramètres',
          tabBarIcon: ({ color, size }) => (
            <Icon as={SettingsIcon} size={size} style={{ color }} />
          ),
        }}
      />
    </Tabs>
  );
}

