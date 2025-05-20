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

export const deleteFolder = async (id) => {
	await prisma.folders.delete({
		where: {
			id: id,
		},
	});
};

export const renameFolder = async (id, title) => {
	await prisma.folders.update({
		where: {
			id: id,
		},
		data: {
			title: title,
		},
	});
};

export const requestFolder = async (id) => {
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
	if (folder.parentId === null) {
		return { id: null, title: null };
	}
	return await requestFolder(folder.parentId);
};
