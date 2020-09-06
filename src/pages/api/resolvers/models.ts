import { GraphQLDate } from 'graphql-iso-date';
import { objectType, asNexusMethod } from '@nexus/schema';

export const GQLDate = asNexusMethod(GraphQLDate, 'date');

export const Post = objectType({
	name: 'Post',
	definition(t) {
		t.model.id();
		t.model.published();
		t.model.title();
		t.model.content();
		t.model.author();
	},
});

export const User = objectType({
	name: 'User',
	definition(t) {
		t.model.id();
		t.model.name();
		t.model.email();
		t.model.posts({
			pagination: true,
		});
	},
});

export const AuthPayload = objectType({
	name: 'AuthPayload',
	definition(t) {
		t.string('accessToken');
		t.field('user', { type: 'User' });
	},
});
