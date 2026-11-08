import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { concrete } from '../theme/palette';
import { monoBold } from '../theme/typography';
import DashboardScreen from '../screens/Dashboard';
import TransactionsScreen from '../screens/Transactions';
import BudgetsScreen from '../screens/Budgets';
import AnalyticsScreen from '../screens/Analytics';
import MoreStack from './MoreStack';

export type AppTabsParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  Budgets: undefined;
  Analytics: undefined;
  More: undefined;
};

const ICONS: Record<keyof AppTabsParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'grid-outline',
  Transactions: 'receipt-outline',
  Budgets: 'wallet-outline',
  Analytics: 'bar-chart-outline',
  More: 'menu-outline',
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: concrete.void,
        tabBarInactiveTintColor: concrete.aggregate,
        tabBarStyle: { backgroundColor: concrete.paper, borderTopColor: concrete.void, borderTopWidth: 2 },
        tabBarLabelStyle: { fontFamily: monoBold, fontSize: 9, letterSpacing: 0.5 },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name as keyof AppTabsParamList]} color={color} size={size * 0.9} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Budgets" component={BudgetsScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="More" component={MoreStack} options={{ title: 'More' }} />
    </Tab.Navigator>
  );
}
