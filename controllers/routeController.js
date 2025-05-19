import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import * as queryController from '../controllers/queryController.js';

export const getIndexPage = async (req, res, next) => {
	try {
		// const { rows } = await selectAllMessages();
		if (req.user) {
			const folders = await queryController.getFolder(req.user.id);
			console.log(folders);
			res.render('index', {
				user: req.user,
				folders: folders,
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
		await queryController.addFolder(req.body.title, req.body.userId);
		res.redirect('/');
	} catch (error) {
		console.error(error);
		next(error);
	}
};
