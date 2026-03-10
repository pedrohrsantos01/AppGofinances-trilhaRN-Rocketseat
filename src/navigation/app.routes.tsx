import React from "react";
import { Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabRoutes() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.secondary,
        tabBarInactiveTintColor: theme.colors.text,
        tabBarLabelPosition: "beside-icon",
        tabBarStyle: {
          height: 88,
          paddingVertical: Platform.OS === "ios" ? 20 : 0,
        },
      }}
    >
      <Tab.Screen
        name="Listagem"
        component={Dashboard}
        options={{
          tabBarIcon: ({ size, color }) => (
            <MaterialIcons name="format-list-bulleted" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cadastrar"
        component={Register}
        options={{
          tabBarIcon: ({ size, color }) => (
            <MaterialIcons name="attach-money" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Resumo"
        component={Resume}
        options={{
          tabBarIcon: ({ size, color }) => (
            <MaterialIcons name="pie-chart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Contas"
        component={AccountList}
        options={{
          tabBarIcon: ({ size, color }) => (
            <MaterialIcons name="account-balance-wallet" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Orçamento"
        component={BudgetList}
        options={{
          tabBarIcon: ({ size, color }) => (
            <MaterialIcons name="donut-small" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppRoutes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabRoutes} />
      <Stack.Screen name="EditTransaction" component={Register} />
      <Stack.Screen name="AccountForm" component={AccountForm} />
      <Stack.Screen name="BudgetForm" component={BudgetForm} />
      <Stack.Screen name="ReminderList" component={ReminderList} />
      <Stack.Screen name="ReminderForm" component={ReminderForm} />
      <Stack.Screen name="ImportExport" component={ImportExportScreen} />
    </Stack.Navigator>
  );
}
