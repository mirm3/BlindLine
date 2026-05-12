import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const isVolunteer = user?.userType === 'volunteer';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: t('tabs.my_trips'),
          tabBarIcon: ({ color }) => <TabBarIcon name="road" color={color} />,
          href: isVolunteer ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="volunteer-home"
        options={{
          title: t('tabs.volunteer'),
          tabBarIcon: ({ color }) => <TabBarIcon name="handshake-o" color={color} />,
          href: isVolunteer ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="volunteer-trips"
        options={{
          title: t('tabs.my_volunteering'),
          tabBarIcon: ({ color }) => <TabBarIcon name="list-alt" color={color} />,
          href: isVolunteer ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
