import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';

function TabIcon({ name, color, size }: { name: string; color: string; size: number }) {
  const icons: Record<string, string> = {
    home: '🏠',
    calendar: '📅',
    users: '👥',
    trophy: '🏆',
  };
  
  const icon = icons[name] || '•';
  
  return (
    <Text style={[styles.icon, { fontSize: size, color }]}>{icon}</Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.slate[400],
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <TabIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <TabIcon name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="players"
        options={{
          title: 'Players',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <TabIcon name="users" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="standings"
        options={{
          title: 'Standings',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <TabIcon name="trophy" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
