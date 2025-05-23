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

export const findUser = async (username) => {
	return await prisma.users.findUnique({
		where: {
			name: username,
		},
	});
};

export const addFolder = async (title, ownerId, parentId) => {
	await prisma.folders.create({
		data: {
			title: title,
			ownerId: ownerId,
			parentId: parseInt(parentId),
		},
	});
};

export const deleteFolder = async (ownerId, id) => {
	await prisma.folders.deleteMany({
		where: {
			AND: [
				{
					id: {
						equals: parseInt(id),
					},
				},
				{
					ownerId: {
						equals: ownerId,
					},
				},
				{
					isRoot: {
						equals: false,
					},
				},
			],
		},
	});
};

export const renameFolder = async (ownerId, id, title) => {
	await prisma.folders.updateMany({
		where: {
			AND: [
				{
					id: {
						equals: parseInt(id),
					},
				},
				{
					ownerId: {
						equals: ownerId,
					},
				},
			],
		},
		data: {
			title: title,
		},
	});
};

export const requestFolder = async (ownerId, id) => {
	id = parseInt(id);
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
						equals: id,
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
		orderBy: {
			createdAt: 'desc',
		},
	});
};

export const requestFolderParent = async (ownerId, id) => {
	const folder = await requestFolder(ownerId, id);
	if (folder[0].parentId === null) {
		return [{ id: null, ownerId: null, title: null }];
	}
	return await requestFolder(ownerId, folder[0].parentId);
};

export const saveFileData = async (title, size, ownerId, parentId) => {
	return await prisma.files.create({
		data: {
			title: title,
			size: parseInt(size),
			ownerId: ownerId,
			parentId: parseInt(parentId),
		},
	});
};

export const requestFiles = async (ownerId, parentId) => {
	return await prisma.files.findMany({
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

export const requestSingleFile = async (ownerId, fileId) => {
	return await prisma.files.findMany({
		where: {
			AND: [
				{
					ownerId: {
						equals: ownerId,
					},
				},
				{
					id: {
						equals: fileId,
					},
				},
			],
		},
	});
};
