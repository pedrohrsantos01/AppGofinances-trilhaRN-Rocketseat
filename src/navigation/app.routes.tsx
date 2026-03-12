import React from "react";
import { Platform, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

import { Dashboard } from "../features/transactions/presentation/Dashboard";
import { Register } from "../features/transactions/presentation/Register";
import { Resume } from "../features/resume/presentation/Resume";
import { AccountList } from "../features/accounts/presentation/AccountList";
import { AccountForm } from "../features/accounts/presentation/AccountForm";
import { BudgetList } from "../features/budget/presentation/BudgetList";
import { BudgetForm } from "../features/budget/presentation/BudgetForm";
import { ReminderList } from "../features/calendar/presentation/ReminderList";
import { ReminderForm } from "../features/calendar/presentation/ReminderForm";
import { ImportExportScreen } from "../features/import-export/presentation/ImportExportScreen";
import { SyncScreen } from "../features/sync/presentation/SyncScreen";
import { GoalList } from "../features/goals/presentation/GoalList";
import { GoalForm } from "../features/goals/presentation/GoalForm";
import { InsightList } from "../features/insights/presentation/InsightList";
import { CashFlowScreen } from "../features/cashflow/presentation/CashFlowScreen";
import { SharingScreen } from "../features/sharing/presentation/SharingScreen";
import { MoreMenu } from "../features/more/presentation/MoreMenu";
import { FAB } from "../shared/presentation/components/FAB";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

type FeatherName = React.ComponentProps<typeof Feather>["name"];

function TabIcon({ name, color, size }: { name: FeatherName; color: string; size: number }) {
  return <Feather name={name} size={size} color={color} />;
}

function EmptyScreen() {
  return <View />;
}

function TabRoutes() {
  const theme = useTheme();
  const navigation = useNavigation<any>();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.text,
          tabBarLabelPosition: "below-icon",
          tabBarStyle: {
            height: Platform.OS === "ios" ? 84 : 64,
            paddingTop: 8,
            paddingBottom: Platform.OS === "ios" ? 24 : 8,
            backgroundColor: theme.colors.surface,
            borderTopWidth: 0,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 8,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          tabBarLabelStyle: {
            fontFamily: theme.fonts.medium,
            fontSize: 11,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={Dashboard}
          options={{
            tabBarIcon: ({ size, color }) => <TabIcon name="home" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Resumo"
          component={Resume}
          options={{
            tabBarIcon: ({ size, color }) => <TabIcon name="pie-chart" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Novo"
          component={EmptyScreen}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
            },
          }}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: () => null,
          }}
        />
        <Tab.Screen
          name="Contas"
          component={AccountList}
          options={{
            tabBarIcon: ({ size, color }) => (
              <TabIcon name="credit-card" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Mais"
          component={MoreMenu}
          options={{
            tabBarIcon: ({ size, color }) => <TabIcon name="menu" color={color} size={size} />,
          }}
        />
      </Tab.Navigator>
      <FAB onPress={() => navigation.navigate("Cadastrar")} />
    </View>
  );
}

export function AppRoutes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabRoutes} />
      <Stack.Screen name="Cadastrar" component={Register} />
      <Stack.Screen name="EditTransaction" component={Register} />
      <Stack.Screen name="AccountForm" component={AccountForm} />
      <Stack.Screen name="BudgetList" component={BudgetList} />
      <Stack.Screen name="BudgetForm" component={BudgetForm} />
      <Stack.Screen name="ReminderList" component={ReminderList} />
      <Stack.Screen name="ReminderForm" component={ReminderForm} />
      <Stack.Screen name="ImportExport" component={ImportExportScreen} />
      <Stack.Screen name="Sync" component={SyncScreen} />
      <Stack.Screen name="GoalList" component={GoalList} />
      <Stack.Screen name="GoalForm" component={GoalForm} />
      <Stack.Screen name="InsightList" component={InsightList} />
      <Stack.Screen name="CashFlow" component={CashFlowScreen} />
      <Stack.Screen name="Sharing" component={SharingScreen} />
    </Stack.Navigator>
  );
}
