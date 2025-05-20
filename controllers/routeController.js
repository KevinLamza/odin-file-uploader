import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import * as queryController from '../controllers/queryController.js';

export const getIndexPage = async (req, res, next) => {
	try {
		if (req.user) {
			let requestedFolder;
			let requestedFolderChildren;
			let requestedFolderParent;

			async function sendToRootFolder(userId) {
				requestedFolderChildren =
					await queryController.requestFolderChildren(userId, null);
				requestedFolder = { id: null, title: null };
				requestedFolderParent = { id: null, title: null };
			}

			if (req.params.folderId === undefined) {
				await sendToRootFolder(req.user.id);
			} else {
				requestedFolderChildren =
					await queryController.requestFolderChildren(
						req.user.id,
						parseInt(req.params.folderId)
					);
				requestedFolder = await queryController.requestFolder(
					parseInt(req.params.folderId)
				);
				requestedFolderParent =
					await queryController.requestFolderParent(
						parseInt(req.params.folderId)
					);
			}
			// this line makes sure that user can't access folder
			// that are not theirs by modifying the url
			if (req.params && req.user.id != requestedFolder.ownerId) {
				await sendToRootFolder(req.user.id);
			}
			res.render('index', {
				user: req.user,
				requestedFolder: requestedFolder,
				requestedFolderChildren: requestedFolderChildren,
				requestedFolderParent: requestedFolderParent,
				editMode: req.query.edit,
			});
		} else {
			res.render('index');
		}
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const getCreateUser = (req, res) => {
	res.render('sign-up-form');
};

export const postCreateUser = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).render('sign-up-form', {
			title: 'sign-up',
			errors: errors.array(),
		});
	}
	try {
		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		await queryController.insertUser(req.body.username, hashedPassword);
		res.redirect('/');
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const getUploadFormPage = async (req, res, next) => {
	try {
		res.render('upload-form');
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const postUploadForm = async (req, res, next) => {
	try {
		res.redirect('/');
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const postAddFolder = async (req, res, next) => {
	try {
		await queryController.addFolder(
			req.body.title,
			req.body.userId,
			parseInt(req.body.parentId)
		);
		// the form is submitting the parentId, but when it's null ...
		// ... html is submitting an emptry string instead of null
		if (req.body.parentId === '') {
			res.redirect('/');
		} else {
			res.redirect('/folder/' + req.body.parentId);
		}
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const postDeleteFolder = async (req, res, next) => {
	try {
		const folder = await queryController.requestFolder(
			parseInt(req.body.folderId)
		);
		if (folder.ownerId === req.body.userId) {
			// parentFolder needs to be saved for redirect before the folder is deleted
			// otherwise parentFolder will be unaccessible and no redirect possible
			const parentFolder = await queryController.requestFolderParent(
				parseInt(req.body.folderId)
			);
			await recursiveFolderDeletion(req.body.userId, req.body.folderId);
			if (parentFolder.id === null) {
				res.redirect('/');
			} else {
				res.redirect('/folder/' + parentFolder.id);
			}
		} else {
			res.redirect('/');
		}
	} catch (error) {
		console.error(error);
		next(error);
	}
};

const recursiveFolderDeletion = async (ownerId, folderId) => {
	try {
		const children = await queryController.requestFolderChildren(
			ownerId,
			parseInt(folderId)
		);
		if (children.length >= 0) {
			children.forEach((child) =>
				recursiveFolderDeletion(ownerId, child.id)
			);
		} else return;
		await queryController.deleteFolder(parseInt(folderId));
	} catch (error) {
		console.error(error);
	}
};

export const postRenameFolder = async (req, res, next) => {
	try {
		await queryController.renameFolder(
			parseInt(req.body.folderId),
			req.body.title
		);
		if (req.body.parentId === '') {
			res.redirect('/');
		} else {
			res.redirect('/folder/' + req.body.parentId);
		}
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const getRenameFolderPage = async (req, res, next) => {
	try {
		const requestedFolder = await queryController.requestFolder(
			parseInt(req.params.folderId)
		);
		const requestedFolderParent = await queryController.requestFolderParent(
			parseInt(req.params.folderId)
		);
		console.log(requestedFolderParent);
		if (req.params && req.user.id != requestedFolder.ownerId) {
			throw new Error('no access');
		} else {
			res.render('rename-folder-form', {
				user: req.user,
				requestedFolder: requestedFolder,
				requestedFolderParent: requestedFolderParent,
				access: false, // hier nochmal reinschauen
			});
		}
	} catch (error) {
		console.error(error);
		next(error);
	}
};
