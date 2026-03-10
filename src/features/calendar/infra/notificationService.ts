import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { subDays, parseISO, differenceInSeconds } from "date-fns";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleReminderNotification(
  reminderId: string,
  title: string,
  dueDate: string,
  daysBefore: number
): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  const triggerDate = subDays(parseISO(dueDate), daysBefore);
  triggerDate.setHours(9, 0, 0, 0);

  const secondsUntil = differenceInSeconds(triggerDate, new Date());
  if (secondsUntil <= 0) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Vencimento proximo",
      body: `${title} vence em ${daysBefore} dia(s)`,
      data: { reminderId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsUntil,
    },
  });

  return id;
}

export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("reminders", {
      name: "Lembretes de vencimento",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}
