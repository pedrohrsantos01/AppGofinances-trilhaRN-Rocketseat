import React from "react";
import { FlatList } from "react-native";

import { Button } from "../../../shared/presentation/components/Form/Button";

import { categories } from "../../../shared/utils/categories";

import {
  Container,
  Header,
  Title,
  Category,
  Icon,
  Name,
  Separator,
  Footer,
} from "./CategorySelectStyles";

interface CategoryOption {
  key: string;
  name: string;
}

interface Props {
  category: CategoryOption;
  setCategory: (name: CategoryOption) => void;
  closeSelectCategory: () => void;
}

export function CategorySelect({ category, setCategory, closeSelectCategory }: Props) {
  function handleCategorySelect(category: CategoryOption) {
    setCategory(category);
  }

  return (
    <Container>
      <Header>
        <Title>Categoria</Title>
      </Header>

      <FlatList
        data={categories}
        style={{ flex: 1, width: "100%" }}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <Category onPress={() => handleCategorySelect(item)} isActive={category.key === item.key}>
            <Icon name={item.icon} />
            <Name>{item.name}</Name>
          </Category>
        )}
        ItemSeparatorComponent={() => <Separator />}
      />

      <Footer>
        <Button title="Selecionar" onPress={closeSelectCategory} />
      </Footer>
    </Container>
  );
}
