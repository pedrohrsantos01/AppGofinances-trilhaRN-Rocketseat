import React from "react";
import { categories } from "../../../utils/categories";

import {
  Container,
  IconWrapper,
  ContentWrapper,
  Title,
  Amount,
  Footer,
  Category,
  Icon,
  CategoryName,
  Date,
} from "./styles";

export interface TransactionCardProps {
  type: "positive" | "negative";
  name: string;
  amount: string;
  category: string;
  date: string;
}

interface Props {
  data: TransactionCardProps;
}

export function TransactionCard({ data }: Props) {
  const [category] = categories.filter((item) => item.key === data.category);

  return (
    <Container>
      <IconWrapper type={data.type}>
        <Icon name={category.icon} />
      </IconWrapper>
      <ContentWrapper>
        <Title>{data.name}</Title>
        <Amount type={data.type}>
          {data.type === "negative" && "- "}
          {data.amount}
        </Amount>
        <Footer>
          <Category>
            <CategoryName>{category.name}</CategoryName>
          </Category>
          <Date>{data.date}</Date>
        </Footer>
      </ContentWrapper>
    </Container>
  );
}
