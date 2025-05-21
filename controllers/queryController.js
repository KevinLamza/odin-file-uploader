import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const insertUser = async (username, password) => {
	await prisma.users.create({
		data: {
			name: username,
			password: password,
			folders: {
				create: [{ title: 'My Drive', isRoot: true, parentId: null }],
			},
		},
	});
};

export const addFolder = async (title, ownerId, parentId) => {
	await prisma.folders.create({
		data: {
			title: title,
			ownerId: ownerId,
			parentId: parentId,
		},
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

export const requestFolder = async (ownerId, id) => {
	return await prisma.folders.findMany({
		where: {
			AND: [
				{
					ownerId: {
						equals: ownerId,
					},
				},
				{
					id: {
						equals: parseInt(id),
					},
				},
			],
		},
	});
};

export const requestRootFolder = async (ownerId) => {
	return await prisma.folders.findMany({
		where: {
			AND: [
				{
					ownerId: {
						equals: ownerId,
					},
				},
				{
					isRoot: {
						equals: true,
					},
				},
			],
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
						equals: parseInt(id),
					},
				},
			],
		},
	});
};

export const requestFolderParent = async (ownerId, parentId) => {
	// const folder = await requestFolder(id);
	if (parentId === null) {
		return [{ id: null, ownerId: null, title: null }];
	}
	return await requestFolder(ownerId, parentId);
};
