const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Buggy Shop API',
    version: '1.1.0',
    description:
      'Deliberately buggy e-commerce API for QA portfolio testing.\n\nThis API intentionally contains validation, auth, and access-control defects for Postman and Newman practice.',
  },
  servers: [{ url: 'http://localhost:4000', description: 'Local server' }],
  tags: [
    { name: 'Health', description: 'Service health endpoints' },
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Products', description: 'Product catalog endpoints' },
    { name: 'Cart', description: 'Shopping cart endpoints' },
    { name: 'Orders', description: 'Order endpoints' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste token from login response. Example: Bearer eyJ...'
      },
    },
    parameters: {
      idPath: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'integer' },
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Unauthorized' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          email: { type: 'string', example: 'user@buggyshop.local' },
          role: { type: 'string', example: 'user' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Wireless Mouse' },
          description: { type: 'string', example: 'Ergonomic and silent click' },
          price: { type: 'number', format: 'float', example: 19.49 },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'user@buggyshop.local' },
          password: { type: 'string', example: 'user123' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
      ProductInput: {
        type: 'object',
        required: ['name', 'price'],
        properties: {
          name: { type: 'string', example: 'Gaming Headset' },
          description: { type: 'string', example: 'Over-ear, low latency' },
          price: { type: 'number', format: 'float', example: 59.99 },
        },
      },
      CartItemInput: {
        type: 'object',
        required: ['productId'],
        properties: {
          productId: { type: 'integer', example: 1 },
          quantity: { type: 'integer', example: 1 },
        },
      },
      CartItemUpdate: {
        type: 'object',
        required: ['quantity'],
        properties: {
          quantity: { type: 'integer', example: 2 },
        },
      },
      CartItem: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 2 },
          productId: { type: 'integer', example: 1 },
          quantity: { type: 'integer', example: 2 },
          product: { $ref: '#/components/schemas/Product' },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          orderId: { type: 'integer', example: 1 },
          productId: { type: 'integer', example: 1 },
          quantity: { type: 'integer', example: 1 },
          price: { type: 'number', format: 'float', example: 19.49 },
          product: { $ref: '#/components/schemas/Product' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 2 },
          total: { type: 'number', format: 'float', example: 78.98 },
          createdAt: { type: 'string', format: 'date-time' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 2 },
              email: { type: 'string', example: 'user@buggyshop.local' },
            },
          },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/OrderItem' },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'Service is up',
            content: {
              'application/json': {
                example: { ok: true, service: 'buggy-shop-api' },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register user',
        description:
          'Creates a user and returns JWT. Intentional bug: duplicate email registration can randomly succeed.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Registered',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '409': {
            description: 'Registration failed',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        description:
          'Returns JWT token. Intentional bugs: empty password may be accepted, and error message is intentionally unclear.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Authenticated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Authenticated user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'List products',
        responses: {
          '200': {
            description: 'Product list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    products: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Product' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Create product (admin)',
        security: [{ bearerAuth: [] }],
        description:
          'Admin-only endpoint. Intentional bugs: accepts negative price and has no long-name validation.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    product: { $ref: '#/components/schemas/Product' },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by id',
        parameters: [{ $ref: '#/components/parameters/idPath' }],
        responses: {
          '200': {
            description: 'Single product',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    product: { $ref: '#/components/schemas/Product' },
                  },
                },
              },
            },
          },
          '404': { description: 'Not found' },
        },
      },
      put: {
        tags: ['Products'],
        summary: 'Update product (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/idPath' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    product: { $ref: '#/components/schemas/Product' },
                  },
                },
              },
            },
          },
          '404': { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete product (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/idPath' }],
        description: 'Deletes the specified product and returns a success response if the product existed.',
        responses: {
          '200': {
            description: 'Success response',
            content: {
              'application/json': {
                example: { success: true, message: 'Product deleted successfully' },
              },
            },
          },
          '404': { description: 'Product not found' },
        },
      },
    },
    '/api/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Get current user cart',
        security: [{ bearerAuth: [] }],
        description:
          'Available to regular users only. Intentional bug: expired JWT may still work on cart endpoints.',
        responses: {
          '200': {
            description: 'Cart items',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/CartItem' },
                    },
                  },
                },
              },
            },
          },
          '403': { description: 'Forbidden (admin role)' },
        },
      },
    },
    '/api/cart/items': {
      post: {
        tags: ['Cart'],
        summary: 'Add cart item',
        security: [{ bearerAuth: [] }],
        description: 'Available to regular users only. Intentional bug: quantity 0 is accepted.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CartItemInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Item added',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    item: { $ref: '#/components/schemas/CartItem' },
                  },
                },
              },
            },
          },
          '400': { description: 'Validation failed' },
          '403': { description: 'Forbidden (admin role)' },
        },
      },
    },
    '/api/cart/items/{id}': {
      put: {
        tags: ['Cart'],
        summary: 'Update cart item quantity',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/idPath' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CartItemUpdate' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Updated item',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    item: { $ref: '#/components/schemas/CartItem' },
                  },
                },
              },
            },
          },
          '404': { description: 'Not found' },
          '403': { description: 'Forbidden (admin role)' },
        },
      },
      delete: {
        tags: ['Cart'],
        summary: 'Delete cart item',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/idPath' }],
        responses: {
          '200': {
            description: 'Deleted',
            content: {
              'application/json': {
                example: { success: true },
              },
            },
          },
          '404': { description: 'Not found' },
          '403': { description: 'Forbidden (admin role)' },
        },
      },
    },
    '/api/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Create order from cart',
        security: [{ bearerAuth: [] }],
        description: 'Regular users only. Creates order from current user cart and clears cart.',
        responses: {
          '201': {
            description: 'Created order',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    order: { $ref: '#/components/schemas/Order' },
                  },
                },
              },
            },
          },
          '400': { description: 'Cart is empty' },
          '403': { description: 'Forbidden (admin role)' },
        },
      },
      get: {
        tags: ['Orders'],
        summary: 'List orders',
        security: [{ bearerAuth: [] }],
        description: 'Users see their own orders. Admin users see all orders.',
        responses: {
          '200': {
            description: 'Order list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    orders: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Order' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order by id',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/idPath' }],
        description: 'Users can access only their own order. Admin users can access any order.',
        responses: {
          '200': {
            description: 'Single order',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    order: { $ref: '#/components/schemas/Order' },
                  },
                },
              },
            },
          },
          '403': { description: 'Forbidden' },
          '404': { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Orders'],
        summary: 'Delete order',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/idPath' }],
        description: 'Admin users can delete any order. Regular users can delete their own order.',
        responses: {
          '200': {
            description: 'Deleted',
            content: {
              'application/json': {
                example: { success: true },
              },
            },
          },
          '403': { description: 'Forbidden' },
          '404': { description: 'Not found' },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
