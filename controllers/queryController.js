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
	console.log(id);
	console.log(typeof id);
	id = parseInt(id);
	console.log(id);
	console.log(typeof id);
	const result = await prisma.folders.findMany({
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
	console.log(result);
	return result;
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

export const requestFolderParent = async (ownerId, id) => {
	console.log('hey');
	console.log(ownerId);
	console.log(id);
	const folder = await requestFolder(ownerId, id);
	console.log(folder);
	if (folder[0].parentId === null) {
		return [{ id: null, ownerId: null, title: null }];
	}
	return await requestFolder(ownerId, folder[0].parentId);
};
