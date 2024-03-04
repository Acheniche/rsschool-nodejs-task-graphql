import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLSchema, parse, validate } from 'graphql';
import { Query } from './query.js';
import depthLimit from 'graphql-depth-limit';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const schema = new GraphQLSchema({
        query: Query,
      });

      const errors = validate(schema, parse(req.body.query), [depthLimit(5)]);
      if (errors.length > 0) {
      return { data: null, errors: errors };
      }
      
      return await graphql({
        schema,
        source: String(req.body.query),
        contextValue: fastify,
        variableValues: req.body.variables,
      });
    },
  });
};

export default plugin;
