import styled from "styled-components/native";
import { RFValue } from "react-native-responsive-fontsize";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "react-native";

interface StatusBadgeProps {
  variant: "accepted" | "pending" | "revoked";
}

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View`
  background-color: ${({ theme }) => theme.colors.primary};
  width: 100%;
  height: ${(StatusBar.currentHeight ?? 44) + RFValue(60)}px;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 19px;
  flex-direction: row;
  padding-left: 24px;
  padding-right: 24px;
`;

export const BackButton = styled.TouchableOpacity``;

export const BackIcon = styled(Feather)`
  color: ${({ theme }) => theme.colors.shape};
  font-size: ${RFValue(24)}px;
`;

export const Title = styled.Text`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(18)}px;
  color: ${({ theme }) => theme.colors.shape};
  text-align: center;
  margin-right: ${RFValue(24)}px;
`;

export const Content = styled.ScrollView.attrs({
  contentContainerStyle: { padding: 24 },
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`;

export const SectionTitle = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.title};
  margin-bottom: 16px;
  margin-top: 8px;
`;

export const InviteRow = styled.View`
  flex-direction: row;
  margin-bottom: 16px;
`;

export const InviteInput = styled.TextInput.attrs(({ theme }) => ({
  placeholderTextColor: theme.colors.text,
}))`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 5px;
  padding: 12px 16px;
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(13)}px;
  color: ${({ theme }) => theme.colors.title};
  margin-right: 8px;
`;

export const InviteButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.secondary};
  border-radius: 5px;
  padding: 12px 16px;
  justify-content: center;
`;

export const InviteButtonText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(13)}px;
  color: ${({ theme }) => theme.colors.shape};
`;

export const ShareCard = styled.View`
  background-color: ${({ theme }) => theme.colors.shape};
  border-radius: 5px;
  padding: ${RFValue(14)}px;
  margin-bottom: 12px;
  flex-direction: row;
  align-items: center;
`;

export const ShareInfo = styled.View`
  flex: 1;
`;

export const ShareEmail = styled.Text`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(13)}px;
  color: ${({ theme }) => theme.colors.title};
`;

export const ShareRole = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(11)}px;
  color: ${({ theme }) => theme.colors.text};
  margin-top: 2px;
`;

export const StatusBadge = styled.Text<StatusBadgeProps>`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(10)}px;
  color: ${({ theme }) => theme.colors.shape};
  background-color: ${({ theme, variant }) =>
    variant === "accepted"
      ? theme.colors.sucess
      : variant === "pending"
        ? "#FF872C"
        : theme.colors.attention};
  padding: 2px 8px;
  border-radius: 10px;
  overflow: hidden;
  margin-right: 8px;
`;

export const RevokeButton = styled.TouchableOpacity`
  padding: 8px;
`;

export const RevokeIcon = styled(Feather)`
  color: ${({ theme }) => theme.colors.attention};
  font-size: ${RFValue(18)}px;
`;

export const EmptyText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(13)}px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  margin-top: 24px;
`;

export const RolePicker = styled.View`
  flex-direction: row;
  margin-bottom: 16px;
`;

export const RoleOption = styled.TouchableOpacity<{ selected?: boolean }>`
  flex: 1;
  padding: 10px;
  border-radius: 5px;
  background-color: ${({ theme, selected }) =>
    selected ? theme.colors.secondary : theme.colors.shape};
  margin-right: 8px;
  align-items: center;
`;

export const RoleOptionText = styled.Text<{ selected?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.medium};
  font-size: ${RFValue(12)}px;
  color: ${({ theme, selected }) => (selected ? theme.colors.shape : theme.colors.text)};
`;

export const NotConfiguredText = styled.Text`
  font-family: ${({ theme }) => theme.fonts.regular};
  font-size: ${RFValue(14)}px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  margin-top: 40px;
  padding: 0 24px;
  line-height: ${RFValue(22)}px;
`;
