import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { TarefasProvider } from '@/context/TarefasContext';

export default function RootLayout() {
  return (
    <TarefasProvider>
      {/* As telas têm cabeçalhos próprios. O Expo Router cuida da navegação. */}
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="light" />
    </TarefasProvider>
  );
}
