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
