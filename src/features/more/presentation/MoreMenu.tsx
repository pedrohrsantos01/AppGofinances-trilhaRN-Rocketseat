import React from "react";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "styled-components/native";
import { useAuth } from "../../auth/presentation/AuthContext";
import { RFValue } from "react-native-responsive-fontsize";

import { ScreenHeader } from "../../../shared/presentation/components/ScreenHeader";

import {
  Container,
  Content,
  Section,
  SectionTitle,
  MenuItem,
  MenuIconWrapper,
  MenuLabel,
  MenuChevron,
} from "./MoreMenuStyles";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

interface MenuItemData {
  icon: FeatherName;
  label: string;
  route: string;
  color: string;
}

const MENU_SECTIONS: { title: string; items: MenuItemData[] }[] = [
  {
    title: "Financeiro",
    items: [
      { icon: "target", label: "Metas", route: "GoalList", color: "#5636D3" },
      { icon: "zap", label: "Insights", route: "InsightList", color: "#FF872C" },
      { icon: "trending-up", label: "Previsao de Caixa", route: "CashFlow", color: "#12A454" },
      { icon: "calendar", label: "Lembretes", route: "ReminderList", color: "#e83f5b" },
    ],
  },
  {
    title: "Dados",
    items: [
      { icon: "upload", label: "Importar / Exportar", route: "ImportExport", color: "#7B61FF" },
      { icon: "cloud", label: "Sincronizacao", route: "Sync", color: "#5636D3" },
      { icon: "users", label: "Compartilhamento", route: "Sharing", color: "#FF872C" },
    ],
  },
];

export function MoreMenu() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { signOut } = useAuth();

  return (
    <Container>
      <ScreenHeader title="Mais" />

      <Content>
        {MENU_SECTIONS.map((section) => (
          <Section key={section.title}>
            <SectionTitle>{section.title}</SectionTitle>
            {section.items.map((item) => (
              <MenuItem key={item.route} onPress={() => navigation.navigate(item.route)}>
                <MenuIconWrapper style={{ backgroundColor: item.color + "18" }}>
                  <Feather name={item.icon} size={RFValue(18)} color={item.color} />
                </MenuIconWrapper>
                <MenuLabel>{item.label}</MenuLabel>
                <MenuChevron name="chevron-right" />
              </MenuItem>
            ))}
          </Section>
        ))}

        <Section>
          <MenuItem onPress={signOut}>
            <MenuIconWrapper style={{ backgroundColor: theme.colors.attention + "18" }}>
              <Feather name="log-out" size={RFValue(18)} color={theme.colors.attention} />
            </MenuIconWrapper>
            <MenuLabel>Sair da conta</MenuLabel>
            <MenuChevron name="chevron-right" />
          </MenuItem>
        </Section>
      </Content>
    </Container>
  );
}
