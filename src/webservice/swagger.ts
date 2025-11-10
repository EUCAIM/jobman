import { type Options } from 'swagger-jsdoc';
import pkg from '../../package.json' with { type: 'json' };

const swaggerOptions: Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Jobman',
      version: pkg.version,
      description: 'Auto-generated API docs'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        apiToken: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Prefix value with "ApiToken ". Example: Authorization: ApiToken abcd1234'
        }
      }
    },
    servers: [
    //   { url: '/api/v1', description: 'This server' }
    ]
  },
  apis: ['./src/webservice/route/*.ts', './src/webservice/model/*.ts', './src/common/model/*.ts', './src/common/model/args/*.ts'] // adjust paths to your JSDoc-annotated files
};

export default swaggerOptions;
