import {
	makeSchema,
	objectType,
	stringArg,
	intArg,
	asNexusMethod,
} from '@nexus/schema';
import { GraphQLDate } from 'graphql-iso-date';
import { PrismaClient } from '@prisma/client';
import { ApolloServer } from 'apollo-server-micro';
import path from 'path';

export const GQLDate = asNexusMethod(GraphQLDate, 'date');

const prisma = new PrismaClient();

const User = objectType({
	name: 'User',
	definition(t) {
		t.int('id');
		t.string('name', { nullable: false });
		t.string('email');
		t.list.field('posts', {
			type: 'Post',
			resolve: (parent) =>
				prisma.user.findOne({ where: { id: Number(parent.id) } }).posts(),
		});
	},
});

const Post = objectType({
	name: 'Post',
	definition(t) {
		t.int('id'),
			t.string('title'),
			t.string('content', {
				nullable: true,
			});
		t.boolean('published');
		t.field('author', {
			type: 'User',
			nullable: true,
			resolve: (parent) =>
				prisma.post.findOne({ where: { id: Number(parent.id) } }).author(),
		});
	},
});

const Query = objectType({
	name: 'Query',
	definition(t) {
		t.list.field('users', {
			type: 'User',
			resolve: () => {
				return prisma.user.findMany();
			},
		});
		t.field('post', {
			type: 'Post',
			nullable: true,
			args: {
				postId: stringArg({ nullable: false }),
			},
			resolve: (_parent, args) => {
				return prisma.post.findOne({ where: { id: Number(args.postId) } });
			},
		});
		t.list.field('feed', {
			type: 'Post',
			resolve: (_parent, _args, _ctx, _info) => {
				return prisma.post.findMany({ where: { published: true } });
			},
		});
		t.list.field('drafts', {
			type: 'Post',
			resolve: () => {
				return prisma.post.findMany({ where: { published: false } });
			},
		});
		t.list.field('filteredPosts', {
			type: 'Post',
			args: {
				searchString: stringArg({ nullable: true }),
			},
			resolve: (_parent, { searchString }, _ctx, _info) => {
				return prisma.post.findMany({
					where: {
						OR: [
							{ title: { contains: searchString as string } },
							{ content: { contains: searchString as string } },
						],
					},
				});
			},
		});
	},
});

const Mutation = objectType({
	name: 'Mutation',
	definition(t) {
		t.field('signupUser', {
			type: 'User',
			args: {
				name: stringArg({ nullable: false }),
				email: stringArg({ nullable: false }),
			},
			resolve: (_, { name, email }, ctx) => {
				return prisma.user.create({
					data: {
						name,
						email,
					},
				});
			},
		});

		t.field('deletePost', {
			type: 'Post',
			nullable: true,
			args: {
				postId: stringArg(),
			},
			resolve: (_, { postId }, ctx) => {
				return prisma.post.delete({
					where: { id: Number(postId) },
				});
			},
		});

		t.field('createDraft', {
			type: 'Post',
			args: {
				title: stringArg({ nullable: false }),
				content: stringArg({ nullable: false }),
				authorEmail: stringArg(),
			},
			resolve: (_, { title, content, authorEmail }, ctx) => {
				return prisma.post.create({
					data: {
						title,
						content,
						published: false,
						author: {
							connect: { email: authorEmail as string },
						},
					},
				});
			},
		});

		t.field('publish', {
			type: 'Post',
			nullable: true,
			args: {
				postId: intArg(),
			},
			resolve: (_, { postId }) => {
				return prisma.post.update({
					where: { id: Number(postId) },
					data: { published: true },
				});
			},
		});
	},
});

export const schema = makeSchema({
	types: [Query, Mutation, Post, User, GQLDate],
	outputs: {
		typegen: path.join(process.cwd(), 'pages', 'api', 'nexus-typegen.ts'),
		schema: path.join(process.cwd(), 'pages', 'api', 'schema.graphql'),
	},
});

export const config = {
	api: {
		bodyParser: false,
	},
};
