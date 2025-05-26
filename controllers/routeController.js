import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import * as queryController from '../controllers/queryController.js';

export const getIndexPage = async (req, res, next) => {
	try {
		if (req.user) {
			next();
		} else {
			res.render('index');
		}
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const getFolderPage = async (req, res, next) => {
	try {
		let requestedFolders;
		let requestedFiles;
		if (req.params.folderId === undefined) {
			requestedFolders = await requestFolders(req.user.id, 0, true);
		} else {
			requestedFolders = await requestFolders(
				req.user.id,
				req.params.folderId
			);
		}
		requestedFiles = await queryController.requestFiles(
			req.user.id,
			requestedFolders.folder[0].id
		);
		console.log(requestedFiles);
		res.render('folders', {
			user: req.user,
			requestedFolders: requestedFolders,
			requestedFiles: requestedFiles,
			editMode: req.query.edit,
		});
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const getFilePage = async (req, res, next) => {
	try {
		// let requestedFolders;
		// let requestedFiles;
		// if (req.params.folderId === undefined) {
		// 	requestedFolders = await requestFolders(req.user.id, 0, true);
		// } else {
		// 	requestedFolders = await requestFolders(
		// 		req.user.id,
		// 		req.params.folderId
		// 	);
		// }
		// requestedFiles = await queryController.requestFiles(
		// 	req.user.id,
		// 	requestedFolders.folder[0].id
		// );
		console.log('hallo');
		const requestedFile = await queryController.requestSingleFile(
			req.user.id,
			req.params.fileId
		);
		console.log(requestedFile);
		res.render('files', {
			user: req.user,
			requestedFile: requestedFile,
		});
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const requestFolders = async (userId, folderId, isRoot = false) => {
	const folders = {};
	if (isRoot) {
		folders.folder = await queryController.requestRootFolder(userId);
		folders.children = await queryController.requestFolderChildren(
			userId,
			folders.folder[0].id
		);
		folders.parent = await queryController.requestFolderParent(
			userId,
			folders.folder[0].id
		);
	} else {
		folders.folder = await queryController.requestFolder(userId, folderId);
		folders.children = await queryController.requestFolderChildren(
			userId,
			folderId
		);
		folders.parent = await queryController.requestFolderParent(
			userId,
			folderId
		);
	}
	return folders;
};

export const getCreateUser = (req, res) => {
	res.render('sign-up-form');
};

export const postCreateUser = async (req, res, next) => {
	let errors = validationResult(req);
	const checkUser = await queryController.findUser(req.body.username);
	errors = errors.array();
	if (checkUser && checkUser.name === req.body.username) {
		errors.push({
			type: 'field',
			value: req.body.username,
			msg: 'A user with this name exists already',
			path: 'username',
			location: 'body',
		});
	}
	if (errors.length !== 0) {
		return res.status(400).render('sign-up-form', {
			title: 'sign-up',
			errors: errors,
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
		await queryController.saveFileData(
			req.file.originalname,
			req.file.size,
			req.user.id,
			req.body.folderId,
			req.file.filename
		);
		console.log('path ' + req.file.path);
		const redirectPath = '/folder/' + req.body.folderId;
		res.redirect(redirectPath);
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const postAddFolder = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const requestedFolders = await requestFolders(req.user.id, 0, true);
		return res.status(400).render('folders', {
			errors: errors.array(),
			user: req.body.userId,
			requestedFolders: requestedFolders,
			editMode: false,
		});
	}
	try {
		await queryController.addFolder(
			req.body.title,
			req.body.userId,
			req.body.folderId
		);
		res.redirect('/folder/' + req.body.folderId);
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const postDeleteFolder = async (req, res, next) => {
	try {
		// parentFolder needs to be saved for redirect before the folder is deleted
		// otherwise parentFolder will be unaccessible and no redirect possible
		const parentFolder = await queryController.requestFolderParent(
			req.body.userId,
			req.body.folderId
		);
		await recursiveFolderDeletion(req.body.userId, req.body.folderId);
		if (parentFolder[0].id === null) {
			res.redirect('/folder');
		} else {
			res.redirect('/folder/' + parentFolder[0].id);
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
		await queryController.deleteFile(ownerId, folderId);
		await queryController.deleteFolder(ownerId, folderId);
	} catch (error) {
		console.error(error);
	}
};

export const postRenameFolder = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const requestedFolders = await requestFolders(
			req.body.userId,
			req.body.folderId
		);
		return res.status(400).render('rename-folder-form', {
			errors: errors.array(),
			requestedFolders: requestedFolders,
			user: req.body.userId,
		});
	}
	try {
		await queryController.renameFolder(
			req.body.userId,
			req.body.folderId,
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
		const requestedFolders = await requestFolders(
			req.user.id,
			req.params.folderId
		);
		res.render('rename-folder-form', {
			user: req.user,
			requestedFolders: requestedFolders,
		});
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const getDownloadFile = async (req, res, next) => {
	try {
		const requestedFile = await queryController.requestSingleFile(
			req.user.id,
			req.params.fileId
		);
		console.log('download');
		res.download(
			`uploads/${requestedFile[0].filename}`,
			requestedFile[0].title
		);
	} catch (error) {
		console.error(error);
		next(error);
	}
};
