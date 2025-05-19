import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const insertUser = async (username, password) => {
	await prisma.users.create({
		data: { name: username, password: password },
	});
};

export const addFolder = async (title, ownerId, parentId) => {
	await prisma.folders.create({
		data: { title: title, ownerId: ownerId, parentId: parentId },
	});
};

export const getFolder = async (ownerId, parentId) => {
	return await prisma.folders.findMany({
		where: {
			AND: [
				{
					ownerId: {
						equals: ownerId,
					},
				},
				{
					parentId: {
						equals: parseInt(parentId),
					},
				},
			],
		},
	});
};

export const getTitle = async (folderId) => {
	return await prisma.folders.findUnique({
		where: {
			id: parseInt(folderId),
		},
		select: {
			title: true,
		},
	});
};
