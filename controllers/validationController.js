import { body } from 'express-validator';

export const validateUser = [
	body('username')
		.trim()
		.isAlpha()
		.withMessage('First name can only contain letters!')
		.isLength({ min: 1, max: 20 })
		.withMessage('Must be between 1 and 20 characters'),
	body('password')
		.trim()
		.isAlphanumeric()
		.isLength({ min: 8 })
		.withMessage('Password needs to be atleast 8 characters long'),
];

export const validateFolderName = [
	body('title')
		.trim()
		// .isAlphanumeric()
		.matches(/^[a-z0-9 ]+$/i)
		.withMessage('Can only contain letters, numbers and spaces!')
		.isLength({ min: 1, max: 20 })
		.withMessage('Must be between 1 and 20 characters'),
];
