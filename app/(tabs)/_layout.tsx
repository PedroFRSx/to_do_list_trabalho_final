import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

export default function LayoutAbas() {
  // Os nomes correspondem aos arquivos de rota dentro de (tabs).
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFADB8',
        tabBarInactiveTintColor: '#E0E8EF',
        tabBarActiveBackgroundColor: '#495B6B',
        tabBarStyle: { backgroundColor: '#304251', borderTopColor: '#627687' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hoje',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="today-outline" size={size} color={focused ? '#FFADB8' : '#E0E8EF'} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendario"
        options={{
          title: 'Calendário',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="calendar-outline" size={size} color={focused ? '#FFADB8' : '#E0E8EF'} />
          ),
        }}
      />
      <Tabs.Screen
        name="progresso"
        options={{
          title: 'Progresso',
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={focused ? '#FFADB8' : '#E0E8EF'} />
          ),
        }}
      />
    </Tabs>
  );
}
