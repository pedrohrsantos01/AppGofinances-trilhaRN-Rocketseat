import "styled-components/native";
import theme from "./theme";

declare module "styled-components/native" {
  type ThemeType = typeof theme;

  export interface DefaultTheme {
    colors: ThemeType["colors"];
    fonts: ThemeType["fonts"];
    spacing: ThemeType["spacing"];
    radius: ThemeType["radius"];
  }
}
