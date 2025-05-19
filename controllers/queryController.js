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

export const requestFolder = async (id) => {
	// console.log('hi');
	// console.log(typeof id + ' ' + id);
	return await prisma.folders.findUnique({
		where: {
			id: id,
		},
	});
};

export const requestFolderChildren = async (ownerId, id) => {
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
						equals: id,
					},
				},
			],
		},
	});
};

export const requestFolderParent = async (id) => {
	const folder = await requestFolder(id);
	// console.log(folder);
	if (folder.parentId === null) {
		return { id: null, title: null };
	}
	return await requestFolder(folder.parentId);
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

export const getParent = async (folderId) => {
	return await prisma.folders.findUnique({
		where: {
			id: parseInt(folderId),
		},
		select: {
			id: true,
			title: true,
		},
	});
};
