import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Corporate Sales Platform API',
      version: '1.0.0',
      description:
        'API para plataforma de vendas corporativas com DDD e TypeORM. ' +
        'Gerencie empresas, produtos, transações e usuários com autenticação JWT.',
      contact: {
        name: 'Suporte',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT obtido no login/registro',
        },
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name: {
              type: 'string',
              minLength: 3,
              example: 'João Silva',
              description: 'Nome do usuário (mínimo 3 caracteres)',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'joao@empresa.com',
              description: 'Email do usuário',
            },
            password: {
              type: 'string',
              minLength: 8,
              example: 'senhaSegura123',
              description: 'Senha do usuário (mínimo 8 caracteres)',
            },
            role: {
              type: 'string',
              enum: ['admin', 'collaborator'],
              example: 'admin',
              description:
                'Papel do usuário. "admin" cria uma nova empresa, "collaborator" precisa de companyId',
            },
            companyId: {
              type: 'string',
              example: '1',
              description:
                'ID da empresa (obrigatório quando role = collaborator)',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'joao@empresa.com',
            },
            password: {
              type: 'string',
              example: 'senhaSegura123',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/UserResponse' },
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
              },
            },
          },
        },

        CreateCompanyRequest: {
          type: 'object',
          required: ['name', 'cnpj', 'description'],
          properties: {
            name: {
              type: 'string',
              minLength: 3,
              example: 'Tech Solutions Ltda',
              description: 'Nome da empresa (mínimo 3 caracteres)',
            },
            cnpj: {
              type: 'string',
              pattern: '^\\d{14}$',
              example: '12345678000199',
              description: 'CNPJ com exatamente 14 dígitos (somente números)',
            },
            description: {
              type: 'string',
              minLength: 10,
              example: 'Empresa de tecnologia e soluções corporativas',
              description: 'Descrição da empresa (mínimo 10 caracteres)',
            },
          },
        },
        UpdateCompanyRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 3,
              example: 'Tech Solutions S.A.',
            },
            cnpj: {
              type: 'string',
              pattern: '^\\d{14}$',
              example: '12345678000199',
            },
            description: {
              type: 'string',
              minLength: 10,
              example: 'Empresa de tecnologia atualizada',
            },
          },
        },
        CompanyResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Tech Solutions Ltda' },
            cnpj: { type: 'string', example: '12345678000199' },
            description: {
              type: 'string',
              example: 'Empresa de tecnologia e soluções corporativas',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-15T10:30:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-15T10:30:00.000Z',
            },
          },
        },

        CreateProductRequest: {
          type: 'object',
          required: ['name', 'price', 'stock'],
          properties: {
            name: {
              type: 'string',
              minLength: 3,
              example: 'Notebook Dell Inspiron',
              description: 'Nome do produto (mínimo 3 caracteres)',
            },
            price: {
              type: 'number',
              minimum: 0.01,
              example: 4599.9,
              description: 'Preço do produto (deve ser positivo)',
            },
            stock: {
              type: 'integer',
              minimum: 0,
              example: 50,
              description: 'Quantidade em estoque (inteiro >= 0)',
            },
          },
        },
        UpdateProductRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 3,
              example: 'Notebook Dell Inspiron 15',
            },
            price: { type: 'number', minimum: 0.01, example: 4299.9 },
            stock: { type: 'integer', minimum: 0, example: 45 },
          },
        },
        ProductResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Notebook Dell Inspiron' },
            price: { type: 'number', example: 4599.9 },
            stock: { type: 'integer', example: 50 },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-15T10:30:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-15T10:30:00.000Z',
            },
          },
        },
        ProductListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ProductResponse' },
                },
                pagination: { $ref: '#/components/schemas/Pagination' },
              },
            },
          },
        },

        PurchaseRequest: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: {
              type: 'integer',
              minimum: 1,
              example: 1,
              description: 'ID do produto a ser comprado',
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              example: 2,
              description: 'Quantidade a ser comprada (inteiro positivo)',
            },
          },
        },
        TransactionResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            quantity: { type: 'integer', example: 2 },
            totalPrice: { type: 'number', example: 9199.8 },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-15T14:00:00.000Z',
            },
            product: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                name: { type: 'string', example: 'Notebook Dell Inspiron' },
                price: { type: 'number', example: 4599.9 },
              },
            },
          },
        },
        TransactionListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/TransactionResponse' },
                },
                pagination: { $ref: '#/components/schemas/Pagination' },
              },
            },
          },
        },

        UserResponse: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'João Silva' },
            email: { type: 'string', example: 'joao@empresa.com' },
            role: { type: 'string', example: 'admin' },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-15T10:30:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-15T10:30:00.000Z',
            },
          },
        },

        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 50 },
            totalPages: { type: 'integer', example: 5 },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Mensagem de erro' },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: { type: 'string' },
              example: [
                'Email is required',
                'Password must be at least 8 characters',
              ],
            },
          },
        },
      },
    },

    paths: {
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Registrar novo usuário',
          description:
            'Cria um novo usuário. Se o role for "admin", uma empresa será associada automaticamente. ' +
            'Se o role for "collaborator", o campo companyId é obrigatório.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterRequest' },
                examples: {
                  admin: {
                    summary: 'Registro como Admin',
                    value: {
                      name: 'João Silva',
                      email: 'joao@empresa.com',
                      password: 'senhaSegura123',
                      role: 'admin',
                    },
                  },
                  collaborator: {
                    summary: 'Registro como Collaborator',
                    value: {
                      name: 'Maria Santos',
                      email: 'maria@empresa.com',
                      password: 'senhaSegura123',
                      role: 'collaborator',
                      companyId: '1',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Usuário registrado com sucesso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
            '400': {
              description: 'Dados inválidos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationError' },
                },
              },
            },
            '409': {
              description: 'Email já cadastrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Fazer login',
          description:
            'Autentica o usuário e retorna um token JWT para uso nas demais rotas.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Login realizado com sucesso',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
            '400': {
              description: 'Dados inválidos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationError' },
                },
              },
            },
            '401': {
              description: 'Credenciais inválidas',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },

      '/companies': {
        post: {
          tags: ['Companies'],
          summary: 'Criar empresa',
          description: 'Cria uma nova empresa. Requer autenticação.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateCompanyRequest' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Empresa criada com sucesso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/CompanyResponse' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Dados inválidos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationError' },
                },
              },
            },
            '401': {
              description: 'Não autenticado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        get: {
          tags: ['Companies'],
          summary: 'Listar todas as empresas',
          description:
            'Retorna a lista de todas as empresas. Requer autenticação.',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Lista de empresas',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/CompanyResponse' },
                      },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Não autenticado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/companies/{id}': {
        get: {
          tags: ['Companies'],
          summary: 'Buscar empresa por ID',
          description:
            'Retorna os detalhes de uma empresa específica. Requer autenticação.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
              description: 'ID da empresa',
              example: 1,
            },
          ],
          responses: {
            '200': {
              description: 'Detalhes da empresa',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/CompanyResponse' },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Não autenticado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '404': {
              description: 'Empresa não encontrada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        put: {
          tags: ['Companies'],
          summary: 'Atualizar empresa',
          description:
            'Atualiza os dados de uma empresa existente. Requer autenticação.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
              description: 'ID da empresa',
              example: 1,
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateCompanyRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Empresa atualizada com sucesso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/CompanyResponse' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Dados inválidos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationError' },
                },
              },
            },
            '401': {
              description: 'Não autenticado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '404': {
              description: 'Empresa não encontrada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        delete: {
          tags: ['Companies'],
          summary: 'Deletar empresa',
          description: 'Remove uma empresa do sistema. Requer autenticação.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
              description: 'ID da empresa',
              example: 1,
            },
          ],
          responses: {
            '204': { description: 'Empresa removida com sucesso' },
            '401': {
              description: 'Não autenticado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '404': {
              description: 'Empresa não encontrada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },

      '/products': {
        post: {
          tags: ['Products'],
          summary: 'Criar produto',
          description:
            'Cria um novo produto vinculado à empresa do usuário. ' +
            'Requer autenticação e role "collaborator" ou "admin".',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateProductRequest' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Produto criado com sucesso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/ProductResponse' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Dados inválidos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationError' },
                },
              },
            },
            '401': {
              description: 'Não autenticado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '403': {
              description: 'Sem permissão (não é collaborator)',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        get: {
          tags: ['Products'],
          summary: 'Listar produtos',
          description:
            'Lista os produtos da empresa do usuário autenticado, com suporte a busca e paginação.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Termo de busca por nome do produto',
              example: 'notebook',
            },
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
              description: 'Número da página',
              example: 1,
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10 },
              description: 'Itens por página',
              example: 10,
            },
          ],
          responses: {
            '200': {
              description: 'Lista paginada de produtos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ProductListResponse' },
                },
              },
            },
            '401': {
              description: 'Não autenticado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/products/{id}': {
        get: {
          tags: ['Products'],
          summary: 'Buscar produto por ID',
          description:
            'Retorna os detalhes de um produto específico. Requer autenticação.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
              description: 'ID do produto',
              example: 1,
            },
          ],
          responses: {
            '200': {
              description: 'Detalhes do produto',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/ProductResponse' },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Não autenticado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '404': {
              description: 'Produto não encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        put: {
          tags: ['Products'],
          summary: 'Atualizar produto',
          description:
            'Atualiza um produto existente. Requer autenticação, role "collaborator" e ser da mesma empresa do produto.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
              description: 'ID do produto',
              example: 1,
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateProductRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Produto atualizado com sucesso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/ProductResponse' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Dados inválidos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidationError' },
                },
              },
            },
            '401': {
              description: 'Não autenticado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '403': {
              description: 'Sem permissão',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '404': {
              description: 'Produto não encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        delete: {
          tags: ['Products'],
          summary: 'Deletar produto',
          description:
            'Remove um produto do sistema. Requer autenticação, role "collaborator" e ser da mesma empresa do produto.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
              description: 'ID do produto',
              example: 1,
            },
          ],
          responses: {
            '204': { description: 'Produto removido com sucesso' },
            '401': {
              description: 'Não autenticado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '403': {
              description: 'Sem permissão',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '404': {
              description: 'Produto não encontrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },

      '/transactions': {
        post: {
          tags: ['Transactions'],
          summary: 'Realizar compra',
          description:
            'Realiza a compra de um produto, criando uma transação. O estoque do produto é decrementado automaticamente.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PurchaseRequest' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Compra realizada com sucesso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        $ref: '#/components/schemas/TransactionResponse',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Dados inválidos ou estoque insuficiente',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '401': {
              description: 'Não autenticado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        get: {
          tags: ['Transactions'],
          summary: 'Listar todas as transações',
          description:
            'Retorna todas as transações do sistema com paginação. Requer autenticação.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
              description: 'Número da página',
              example: 1,
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10 },
              description: 'Itens por página',
              example: 10,
            },
          ],
          responses: {
            '200': {
              description: 'Lista paginada de transações',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/TransactionListResponse',
                  },
                },
              },
            },
            '401': {
              description: 'Não autenticado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/transactions/me': {
        get: {
          tags: ['Transactions'],
          summary: 'Listar minhas transações',
          description:
            'Retorna as transações do usuário autenticado com paginação.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
              description: 'Número da página',
              example: 1,
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10 },
              description: 'Itens por página',
              example: 10,
            },
          ],
          responses: {
            '200': {
              description: 'Lista paginada de transações do usuário',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/TransactionListResponse',
                  },
                },
              },
            },
            '401': {
              description: 'Não autenticado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },

      '/users/me': {
        get: {
          tags: ['Users'],
          summary: 'Obter perfil do usuário',
          description: 'Retorna os dados do perfil do usuário autenticado.',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Perfil do usuário',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/UserResponse' },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Não autenticado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/users': {
        get: {
          tags: ['Users'],
          summary: 'Listar todos os usuários',
          description:
            'Retorna a lista de todos os usuários com paginação. Requer autenticação.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
              description: 'Número da página',
              example: 1,
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10 },
              description: 'Itens por página',
              example: 10,
            },
          ],
          responses: {
            '200': {
              description: 'Lista de usuários',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/UserResponse' },
                      },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Não autenticado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },

      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          description: 'Verifica se a API está online e respondendo.',
          responses: {
            '200': {
              description: 'API online',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      timestamp: {
                        type: 'string',
                        format: 'date-time',
                        example: '2026-01-15T10:30:00.000Z',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    tags: [
      { name: 'Health', description: 'Verificação de saúde da API' },
      { name: 'Auth', description: 'Autenticação e registro de usuários' },
      { name: 'Companies', description: 'Gestão de empresas' },
      { name: 'Products', description: 'Gestão de produtos' },
      { name: 'Transactions', description: 'Transações de compra' },
      { name: 'Users', description: 'Gestão de usuários' },
    ],
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
