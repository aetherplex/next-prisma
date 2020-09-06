import { ApolloServer } from 'apollo-server-micro';
import { applyMiddleware } from 'graphql-middleware';
import { schema } from './schema';
import { isDev } from './utils/constants';
import { createContext } from './utils/helpers';
import { permissions } from './utils/rules';
import cors from 'micro-cors';

const apolloServer = new ApolloServer({
	schema: applyMiddleware(schema, permissions),
	context: createContext,
	playground: true,
	tracing: isDev(),
	introspection: true,
	debug: isDev(),
});

const handler = apolloServer.createHandler({
	path: '/api',
});

export default cors((req, res) =>
	req.method === 'OPTIONS' ? res.end : handler(req, res)
);
