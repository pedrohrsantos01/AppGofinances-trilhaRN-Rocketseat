import React from "react";
import { HighLightCard } from "../../components/HighLightCard";
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
                <HighLightCard />
                <HighLightCard />
                <HighLightCard />
            </HighLightCards>
        </Container>
    )
}


