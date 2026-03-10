// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => {
  const View = require("react-native/Libraries/Components/View/View");
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
    TouchableWithoutFeedback: View,
    GestureHandlerRootView: View,
  };
});

// Mock expo-auth-session
jest.mock("expo-auth-session", () => ({
  makeRedirectUri: jest.fn(() => "mock-redirect-uri"),
  ResponseType: { Token: "token" },
  AuthRequest: jest.fn(),
  getDefaultReturnUrl: jest.fn(() => "mock-return-url"),
}));

// Mock expo-apple-authentication
jest.mock("expo-apple-authentication", () => ({
  signInAsync: jest.fn(),
  AppleAuthenticationScope: {
    FULL_NAME: 0,
    EMAIL: 1,
  },
}));

// Mock expo-web-browser
jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));

// Mock expo-font
jest.mock("expo-font", () => ({
  useFonts: jest.fn(() => [true]),
  isLoaded: jest.fn(() => true),
}));

// Mock expo-splash-screen
jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

// Mock react-native-svg
jest.mock("react-native-svg", () => {
  const React = require("react");
  const MockSvg = (props: any) => React.createElement("svg", props);
  return {
    __esModule: true,
    default: MockSvg,
    Svg: MockSvg,
    Circle: "Circle",
    Rect: "Rect",
    Path: "Path",
    G: "G",
    Text: "Text",
    Line: "Line",
    Polygon: "Polygon",
    Polyline: "Polyline",
    Defs: "Defs",
    Stop: "Stop",
    LinearGradient: "LinearGradient",
    RadialGradient: "RadialGradient",
    ClipPath: "ClipPath",
  };
});

// Mock victory-native
jest.mock("victory-native", () => ({
  VictoryPie: "VictoryPie",
}));

// Mock expo-notifications
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue("mock-notification-id"),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 1 },
  AndroidImportance: { HIGH: 4 },
}));

// Mock expo-sqlite with in-memory store for integration tests
jest.mock("expo-sqlite", () => {
  const stores: Record<string, Record<string, unknown>[]> = {};

  function getTable(name: string): Record<string, unknown>[] {
    if (!stores[name]) stores[name] = [];
    return stores[name];
  }

  function parseInsert(
    sql: string,
    params: unknown[]
  ): { table: string; row: Record<string, unknown> } | null {
    const match = sql.match(/INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)/i);
    if (!match) return null;
    const table = match[1];
    const columns = match[2].split(",").map((c: string) => c.trim());
    const row: Record<string, unknown> = {};
    columns.forEach((col: string, i: number) => {
      row[col] = params[i] ?? null;
    });
    return { table, row };
  }

  function parseSelect(
    sql: string,
    params: unknown[]
  ): { table: string; conditions: Record<string, unknown> } {
    const tableMatch = sql.match(/FROM\s+(\w+)/i);
    const table = tableMatch ? tableMatch[1] : "";
    const conditions: Record<string, unknown> = {};
    const whereMatches = [...sql.matchAll(/(\w+)\s*=\s*\?/g)];
    whereMatches.forEach((m, i) => {
      conditions[m[1]] = params[i];
    });
    return { table, conditions };
  }

  function matchesConditions(
    row: Record<string, unknown>,
    conditions: Record<string, unknown>
  ): boolean {
    return Object.entries(conditions).every(([key, value]) => row[key] === value);
  }

  const mockDb = {
    runAsync: jest.fn(async (sql: string, params: unknown[] = []) => {
      const sqlUpper = sql.trim().toUpperCase();
      if (sqlUpper.startsWith("INSERT")) {
        const parsed = parseInsert(sql, params);
        if (parsed) {
          getTable(parsed.table).push(parsed.row);
        }
      } else if (sqlUpper.startsWith("DELETE")) {
        const { table, conditions } = parseSelect(sql, params);
        const t = getTable(table);
        const filtered = t.filter((row) => !matchesConditions(row, conditions));
        stores[table] = filtered;
      } else if (sqlUpper.startsWith("UPDATE")) {
        // Simple update - not fully implemented for all cases
      }
      return { changes: 1 };
    }),
    getAllAsync: jest.fn(async (sql: string, params: unknown[] = []) => {
      const { table, conditions } = parseSelect(sql, params);
      const t = getTable(table);
      return t.filter((row) => matchesConditions(row, conditions));
    }),
    getFirstAsync: jest.fn(async (sql: string, params: unknown[] = []) => {
      const { table, conditions } = parseSelect(sql, params);
      const t = getTable(table);
      return t.find((row) => matchesConditions(row, conditions)) ?? null;
    }),
    execAsync: jest.fn(async () => {}),
    withExclusiveTransactionAsync: jest.fn(async (fn: (txn: unknown) => Promise<void>) => {
      await fn(mockDb);
    }),
    closeAsync: jest.fn(async () => {}),
  };

  return {
    openDatabaseAsync: jest.fn(async () => mockDb),
    __resetStores: () => {
      Object.keys(stores).forEach((key) => delete stores[key]);
    },
    __mockDb: mockDb,
  };
});
