import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const insertUser = async (username, password) => {
	await prisma.users.create({
		data: { name: username, password: password },
	});
};

export const addFolder = async (title, ownerId, parentId) => {
	await prisma.folders.create({
		data: { title: title, ownerId: ownerId, parentId },
	});
};

export const getFolder = async (ownerId) => {
	return await prisma.folders.findMany({
		where: {
			ownerId: {
				equals: ownerId,
			},
		},
	});
};
