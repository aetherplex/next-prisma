import { stringArg, mutationField, intArg } from '@nexus/schema';

export const createDraft = mutationField('createDraft', {
	type: 'Post',
	args: {
		title: stringArg({ nullable: false }),
		content: stringArg({ nullable: false }),
	},
	resolve: async (_parent, { title, content }, ctx) => {
		const newPost = await ctx.prisma.post.create({
			data: {
				title,
				content,
				published: false,
				author: { connect: { id: ctx.userId } },
			},
		});
		ctx.pubsub.publish('latestPost', newPost);
		return newPost;
	},
});

export const deletePost = mutationField('deletePost', {
	type: 'Post',
	nullable: true,
	args: { postId: intArg() },
	resolve: (_parent, { postId }, ctx) => {
		return ctx.prisma.post.delete({ where: { postId } });
	},
});

export const publish = mutationField('publish', {
	type: 'Post',
	nullable: true,
	args: { postId: intArg() },
	resolve: (_parent, { postId }, ctx) => {
		return ctx.prisma.post.update({
			where: { postId },
			data: { published: true },
		});
	},
});
