import { Stack } from 'expo-router';
import { QueryProvider } from '@/providers/QueryProvider';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <QueryProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f8fafc' },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="match/[id]" 
          options={{ 
            presentation: 'modal',
            headerShown: true,
            title: 'Match Details',
            headerStyle: { backgroundColor: '#10b981' },
            headerTintColor: '#ffffff',
          }} 
        />
      </Stack>
    </QueryProvider>
  );
}
