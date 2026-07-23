import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { SearchTabIcon, PawIcon, PlusIcon, BellIcon, ProfileIcon } from '../components/Icons';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// Tab Screens
import HomeScreen from '../screens/HomeScreen';
import AdoptionScreen from '../screens/AdoptionScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Stack Screens (acessíveis via tabs)
import ReportLostScreen from '../screens/ReportLostScreen';
import ReportFoundScreen from '../screens/ReportFoundScreen';
import AdminAdoptionScreen from '../screens/AdminAdoptionScreen';
import ResultsScreen from '../screens/ResultsScreen';
import PetDetailsScreen from '../screens/PetDetailsScreen';
import ChatListScreen from '../screens/ChatListScreen';
import UserContextsScreen from '../screens/UserContextsScreen';
import ChatScreen from '../screens/ChatScreen';
import SeeAllScreen from '../screens/SeeAllScreen';
import MyPetsScreen from '../screens/MyPetsScreen';
import MyFavoritesScreen from '../screens/MyFavoritesScreen';
import AboutScreen from '../screens/AboutScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ IconComponent, focused }) {
  return (
    <View style={{ opacity: focused ? 1 : 0.6 }}>
      <IconComponent size={24} color={focused ? COLORS.primary : COLORS.textTitle} />
    </View>
  );
}

function CenterTabButton() {
  return (
    <View style={styles.centerButton}>
      <PlusIcon size={24} color={COLORS.textWhite} />
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTitle,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Buscar',
          tabBarIcon: ({ focused }) => <TabIcon IconComponent={SearchTabIcon} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Adoption"
        component={AdoptionScreen}
        options={{
          tabBarLabel: 'Adoção',
          tabBarIcon: ({ focused }) => <TabIcon IconComponent={PawIcon} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Add"
        component={ReportLostScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => <CenterTabButton />,
          tabBarStyle: { display: 'none' },
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('ReportLost');
          },
        })}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alertas',
          tabBarIcon: ({ focused }) => <TabIcon IconComponent={BellIcon} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon IconComponent={ProfileIcon} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Auth Stack */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        {/* Main App (tabs) */}
        <Stack.Screen name="MainTabs" component={MainTabs} />

        {/* Modal / Detail Screens (acessíveis de qualquer tab) */}
        <Stack.Screen name="PetDetails" component={PetDetailsScreen} />
        <Stack.Screen name="ReportLost" component={ReportLostScreen} />
        <Stack.Screen name="ReportFound" component={ReportFoundScreen} />
        <Stack.Screen name="AdminAdoption" component={AdminAdoptionScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="ChatList" component={ChatListScreen} />
        <Stack.Screen name="UserContexts" component={UserContextsScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="SeeAll" component={SeeAllScreen} />
        <Stack.Screen name="MyPets" component={MyPetsScreen} />
        <Stack.Screen name="MyFavorites" component={MyFavoritesScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.background,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    height: 75,
    paddingBottom: 20,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: SIZES.fontSm,
    ...FONTS.medium,
    marginTop: 2,
  },
  centerButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  centerIcon: {
    fontSize: 28,
    color: COLORS.textWhite,
    ...FONTS.bold,
    lineHeight: 30,
  },
});
