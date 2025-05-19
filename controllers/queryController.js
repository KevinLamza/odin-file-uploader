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

export const requestFolder = async (ownerId, id) => {
	return await prisma.folders.findUnique({
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

export const requestFolderParent = async (ownerId, id) => {
	const parent = requestFolder(ownerId, id);
	return await prisma.folders.findUnique(ownerId, parent.id);
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
