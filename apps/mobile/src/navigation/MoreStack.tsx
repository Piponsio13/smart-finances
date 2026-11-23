import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { concrete } from '../theme/palette';
import { headingFont } from '../theme/typography';
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
        headerTitleStyle: { fontFamily: headingFont, fontWeight: '600', fontSize: 17 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="MoreMenu" component={MoreMenuScreen} options={{ title: 'More' }} />
      <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Categories' }} />
      <Stack.Screen name="Recurring" component={RecurringScreen} options={{ title: 'Recurring' }} />
      <Stack.Screen name="Savings" component={SavingsScreen} options={{ title: 'Savings' }} />
      <Stack.Screen name="Bills" component={BillsScreen} options={{ title: 'Bills' }} />
    </Stack.Navigator>
  );
}
