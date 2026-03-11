import { Platform } from "react-native";
import { subDays, parseISO, differenceInSeconds } from "date-fns";

let Notifications: typeof import("expo-notifications") | null = null;

async function getNotifications() {
  if (Notifications) return Notifications;
  try {
    Notifications = await import("expo-notifications");
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    return Notifications;
  } catch {
    return null;
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const mod = await getNotifications();
  if (!mod) return false;

  try {
    const { status: existing } = await mod.getPermissionsAsync();
    if (existing === "granted") return true;

    const { status } = await mod.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

export async function scheduleReminderNotification(
  reminderId: string,
  title: string,
  dueDate: string,
  daysBefore: number
): Promise<string | null> {
  const mod = await getNotifications();
  if (!mod) return null;

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  const triggerDate = subDays(parseISO(dueDate), daysBefore);
  triggerDate.setHours(9, 0, 0, 0);

  const secondsUntil = differenceInSeconds(triggerDate, new Date());
  if (secondsUntil <= 0) return null;

  try {
    const id = await mod.scheduleNotificationAsync({
      content: {
        title: "Vencimento proximo",
        body: `${title} vence em ${daysBefore} dia(s)`,
        data: { reminderId },
      },
      trigger: {
        type: mod.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntil,
      },
    });
    return id;
  } catch {
    return null;
  }
}

export async function cancelNotification(notificationId: string): Promise<void> {
  const mod = await getNotifications();
  if (!mod) return;
  try {
    await mod.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // ignore in Expo Go
  }
}

export async function cancelAllNotifications(): Promise<void> {
  const mod = await getNotifications();
  if (!mod) return;
  try {
    await mod.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore in Expo Go
  }
}

export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  const mod = await getNotifications();
  if (!mod) return;
  try {
    await mod.setNotificationChannelAsync("reminders", {
      name: "Lembretes de vencimento",
      importance: mod.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  } catch {
    // ignore in Expo Go
  }
}
