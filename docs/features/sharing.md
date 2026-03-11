# Compartilhamento Opcional

## Resumo
Permite compartilhar dados financeiros com familiares ou parceiros, com controle de permissoes (visualizacao ou edicao).

## Arquitetura

```
features/sharing/
├── domain/
│   └── sharingRules.ts          # canUserRead, canUserEdit, isOwner, validateInvite, getActiveShares
├── application/
│   ├── inviteUser.ts            # Cria convite pendente
│   └── revokeAccess.ts          # Revoga acesso existente
├── infra/
│   └── SharedAccessRepository.ts # CRUD via Supabase (feature cloud-only)
└── presentation/
    ├── SharingScreen.tsx        # Tela de convites e gerenciamento
    └── SharingStyles.ts         # Styled components
```

## Entidade

```typescript
interface SharedAccess {
  id: string;
  owner_user_id: string;
  shared_with_user_id: string;
  shared_with_email: string;
  role: "owner" | "editor" | "viewer";
  status: "pending" | "accepted" | "rejected" | "revoked";
  // ...metadata
}
```

## Regras de Permissao
- **Owner**: leitura + escrita total
- **Editor**: leitura + escrita (accepted status)
- **Viewer**: somente leitura (accepted status)
- Pending/revoked/rejected: sem acesso

## Fluxo
1. Owner insere email + seleciona role (viewer/editor)
2. Sistema cria SharedAccess com status "pending"
3. Convidado aceita (via Supabase auth) → status "accepted"
4. Owner pode revogar a qualquer momento → status "revoked"

## Requisitos
- Supabase configurado (EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY)
- Tabela `shared_access` no Supabase com RLS policies

## Navegacao
- Acessivel via icone "users" no header do Dashboard
- Stack screen: `Sharing`

## Testes
- 18 testes unitarios (sharingRules): permissoes, validacao, filtros
- 5 testes de aplicacao (inviteUser, revokeAccess): convite, duplicidade, revogacao
- Regressao: isolamento de dados entre familias
