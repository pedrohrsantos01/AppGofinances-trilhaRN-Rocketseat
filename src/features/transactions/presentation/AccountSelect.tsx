import React, { useCallback, useState } from "react";
import { FlatList } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { Button } from "../../../shared/presentation/components/Form/Button";
import { useAuth } from "../../auth/presentation/AuthContext";
import { AccountRepository } from "../../accounts/infra/AccountRepository";
import type { Account } from "../../../shared/domain/entities/Account";

import { Container, Header, Title, Separator, Footer } from "./CategorySelectStyles";

import { AccountItem, AccountColorDot, AccountItemName } from "./AccountSelectStyles";

const accountRepo = new AccountRepository();

interface SelectedAccount {
  id: string;
  name: string;
}

interface Props {
  account: SelectedAccount;
  setAccount: (account: SelectedAccount) => void;
  closeSelectAccount: () => void;
}

export function AccountSelect({ account, setAccount, closeSelectAccount }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const data = await accountRepo.listByUser(user.id);
        setAccounts(data);
      }
      load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <Container>
      <Header>
        <Title>Conta</Title>
      </Header>

      <FlatList
        data={accounts}
        style={{ flex: 1, width: "100%" }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AccountItem
            onPress={() => setAccount({ id: item.id, name: item.name })}
            isActive={account.id === item.id}
          >
            <AccountColorDot color={item.color} />
            <AccountItemName>{item.name}</AccountItemName>
          </AccountItem>
        )}
        ItemSeparatorComponent={() => <Separator />}
      />

      <Footer>
        <Button title="Selecionar" onPress={closeSelectAccount} />
      </Footer>
    </Container>
  );
}
