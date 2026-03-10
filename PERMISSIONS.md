# Matriz de Permissões - Plataforma de Vendas Corporativas

| Ação | Consumer | Collaborator (própria empresa) | Collaborator (outra empresa) |
|------|----------|------|------|
| Listar produtos | ✅ | ✅ | ✅ |
| Criar produto | ❌ | ✅ | ❌ |
| Editar produto | ❌ | ✅ | ❌ |
| Excluir produto | ❌ | ✅ | ❌ |
| Comprar | ✅ | ✅ | ✅ |
| Gerenciar empresa | ❌ | ✅ (própria) | ❌ |

## Middlewares

### ensureCollaborator
- Rejeita se `user.role !== 'collaborator'`
- Status: 403 Forbidden

### ensureCompanyOwnership(entityType, paramKey)
- Valida propriedade da entidade (Product, etc)
- Compara `entity.company.id === req.user.companyId`
- Status: 403 Forbidden se não bater

### authorize(...policies)
- Encadeia múltiplas regras
- Retorna 403 se qualquer policy falhar