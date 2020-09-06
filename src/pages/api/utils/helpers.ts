import { PrismaClient } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';
import { sign, verify, Secret } from 'jsonwebtoken';
import { APP_SECRET, tokens } from './constants';
import { Context, Token } from '../types';

export const handleError = (error: any) => {
	// TODO: add Sentry for logging
	throw error;
};

export const generateAccessToken = (userId: number) => {
	const accessToken = sign(
		{
			userId,
			type: tokens.access.name,
			timestamp: Date.now(),
		},
		APP_SECRET as Secret,
		{
			expiresIn: tokens.access.expiry,
		}
	);
	return accessToken;
};

export const prisma = new PrismaClient();
const pubsub = new PubSub();

export const createContext = (ctx: any): Context => {
	let userId: number;
	try {
		let Authorization = '';
		try {
			// For queries and mutations
			Authorization = ctx.req.get('Authorization');
		} catch (e) {
			// Specifically for subscriptions as the above will fail
			Authorization = ctx?.connection?.context?.Authorization;
		}
		const token = Authorization.replace('Bearer ', '');
		const verifiedToken = verify(token, APP_SECRET as Secret) as Token;

		if (!verifiedToken.userId && verifiedToken.type !== tokens.access.name) {
			userId = -1;
		} else {
			userId = verifiedToken.userId;
		}
	} catch (e) {
		userId = -1;
	}
	return {
		...ctx,
		prisma,
		pubsub,
		userId,
	};
};
