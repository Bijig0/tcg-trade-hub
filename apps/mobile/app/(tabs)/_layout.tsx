import { Tabs } from 'expo-router';
import { Layers, MessageCircle, Calendar, User } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';

const TabsLayout = () => {
  const { tabBar } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tabBar.activeTintColor,
        tabBarInactiveTintColor: tabBar.inactiveTintColor,
        tabBarStyle: { backgroundColor: tabBar.backgroundColor },
      }}
    >
      <Tabs.Screen
        name="(listings)"
        options={{
          title: 'Listings',
          tabBarIcon: ({ color, size }) => <Layers size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(messages)"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(meetups)"
        options={{
          title: 'Meetups',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
