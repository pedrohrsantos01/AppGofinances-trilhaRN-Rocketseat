import React from "react";

import { HighLightCard } from "../../components/HighLightCard";
import { TransactionCard } from "../../components/TransactionCard";

import { Container,
    Header,
    UserWrapper,
    UserInfo,
    User,
    Photo,
    UserGreetings,
    UserName,
    Icon,
    HighLightCards,
    Transactions,
    Title,
 } from "./styles";

export function Dashboard() {
    return(
        <Container>
            <Header>
                <UserWrapper>
                    <UserInfo>
                        <Photo source={{ uri: 'https://avatars.githubusercontent.com/u/88248117?v=4' }} />

                        <User>
                            <UserGreetings>Olá,</UserGreetings>
                            <UserName>Pedro</UserName>
                        </User>
                    </UserInfo>
                   <Icon name="power" /> 
                </UserWrapper>
            </Header>
            <HighLightCards >
                <HighLightCard 
                type="up"
                title='Entradas' 
                amount='R$ 17.400,00' 
                lastTransaction='Última entrade dia 13 de abril'
                />
                <HighLightCard 
                type="down"
                title='Saídas' 
                amount='R$ 1.259,00' 
                lastTransaction='Última saída dia 03 de abril'
                />
                <HighLightCard 
                type="total"
                title='Total' 
                amount='R$ 16.141,00' 
                lastTransaction='01 à 16 de abril'
                />
            </HighLightCards>

            <Transactions>
                <Title>Listagem</Title>

                <TransactionCard />
            </Transactions>


        </Container>
    )
}


