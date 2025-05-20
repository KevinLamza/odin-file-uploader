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
		console.log(req.body.title);
		console.log(req.body.userId);
		await queryController.addFolder(
			req.body.title,
			req.body.userId,
			parseInt(req.body.parentId)
		);
		res.redirect('/');
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const postDeleteFolder = async (req, res, next) => {
	try {
		console.log(req.body.userId);
		console.log(req.body.folderId);

		const folder = await queryController.requestFolder(req.body.folderId);
		if (folder.ownerId === req.body.userId) {
			// something
		} else {
			// something
		}
	} catch (error) {
		console.error(error);
		next(error);
	}
};
