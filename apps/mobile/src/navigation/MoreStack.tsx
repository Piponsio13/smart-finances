import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { concrete } from '../theme/palette';
import { monoBold } from '../theme/typography';
import MoreMenuScreen from '../screens/MoreMenu';
import CategoriesScreen from '../screens/Categories';
import RecurringScreen from '../screens/Recurring';
import SavingsScreen from '../screens/Savings';
import BillsScreen from '../screens/Bills';

export type MoreStackParamList = {
  MoreMenu: undefined;
  Categories: undefined;
  Recurring: undefined;
  Savings: undefined;
  Bills: undefined;
};

const Stack = createNativeStackNavigator<MoreStackParamList>();

export default function MoreStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: concrete.charcoal },
        headerTintColor: concrete.paper,
        headerTitleStyle: { fontFamily: monoBold, fontSize: 13 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="MoreMenu" component={MoreMenuScreen} options={{ title: 'MORE' }} />
      <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'CATEGORIES' }} />
      <Stack.Screen name="Recurring" component={RecurringScreen} options={{ title: 'RECURRING' }} />
      <Stack.Screen name="Savings" component={SavingsScreen} options={{ title: 'SAVINGS' }} />
      <Stack.Screen name="Bills" component={BillsScreen} options={{ title: 'BILLS' }} />
    </Stack.Navigator>
  );
}
