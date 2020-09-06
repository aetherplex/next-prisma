import { nexusSchemaPrisma } from 'nexus-plugin-prisma/schema';
import { makeSchema } from '@nexus/schema';
import { join } from 'path';
import * as allTypes from './resolvers';
import { Context } from './types';

const nexusPrisma = nexusSchemaPrisma({
	experimentalCRUD: true,
	paginationStrategy: 'prisma',
	prismaClient: (ctx: Context) => ctx.prisma,
});

export const schema = makeSchema({
	types: [allTypes],
	plugins: [nexusPrisma],
	outputs: {
		typegen: join(__dirname, 'pages', 'api', 'nexus-typegen.ts'),
		schema: join(__dirname, 'pages', 'api', 'schema.graphql'),
	},
	typegenAutoConfig: {
		sources: [
			{
				source: '@prisma/client',
				alias: 'prisma',
			},
			{
				source: join(__dirname, 'types.ts'),
				alias: 'ctx',
			},
		],
		contextType: 'ctx.Context',
	},
});
