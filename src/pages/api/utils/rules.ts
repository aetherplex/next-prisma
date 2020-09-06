import { shield, allow, rule } from 'graphql-shield';
import { Context } from '../types';
import { handleError } from './helpers';
import { errors } from './constants';

export const rules = {
	isAuthenticatedUser: rule({ cache: 'contextual' })(
		(_parent, _args, ctx: Context) => {
			try {
				if (ctx.userId === -1) {
					return handleError(errors.notAuthenticated);
				}
				return true;
			} catch (e) {
				return e;
			}
		}
	),

	isPostOwner: rule({ cache: 'contextual' })(
		async (_parent, { id }, ctx: Context) => {
			try {
				const author = await ctx.prisma.post
					.findOne({
						where: {
							id,
						},
					})
					.author();
				if (author) {
					return ctx.userId === author.id;
				} else {
					return false;
				}
			} catch (e) {
				return e;
			}
		}
	),
};

export const permissions = shield({
	Query: {
		me: rules.isAuthenticatedUser,
		filterPosts: rules.isAuthenticatedUser,
		post: rules.isAuthenticatedUser,
		'*': allow,
	},
	Mutation: {
		createDraft: rules.isAuthenticatedUser,
		deletePost: rules.isPostOwner,
		publish: rules.isPostOwner,
	},
	Subscription: {
		latestPost: rules.isAuthenticatedUser,
	},
});
