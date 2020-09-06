import { ApolloServer } from 'apollo-server-micro';
// import { applyMiddleware } from 'graphql-middleware';
import { schema } from './schema';
import { isDev } from './utils/constants';
import { createContext } from './utils/helpers';
// import { permissions } from './utils/rules';
// import cors from 'micro-cors';
// import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default new ApolloServer({
	schema,
	context: createContext,
	playground: true,
	tracing: isDev(),
	introspection: true,
	debug: isDev(),
}).createHandler({
	path: '/api',
});

// export default async function(req: NextApiRequest, res: NextApiResponse) {
// 	cors((req, res) => {
// 		return new Promise((resolve, _reject) => {
// 			if (req.method === 'OPTIONS') {
// 				res.end();
// 				return resolve();
// 			} else {
// 				handler(req, res);
// 				return resolve();
// 			}
// 		});
// 	});
// }
