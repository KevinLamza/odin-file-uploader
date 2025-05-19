import { Router } from 'express';
import * as authentificationController from '../controllers/authentificationController.js';
import { validateUser } from '../controllers/validationController.js';
import * as routeController from '../controllers/routeController.js';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

export const routes = Router();

routes.get('/', routeController.getIndexPage);
routes.get('/sign-up-form', routeController.getCreateUser);
routes.post('/sign-up-form', validateUser, routeController.postCreateUser);
routes.post(
	'/log-in',
	authentificationController.authenticateUser,
	routeController.getIndexPage
);
routes.get('/log-out', authentificationController.logOut);
routes.get(
	'/upload-form',
	authentificationController.isAuthenticated,
	routeController.getUploadFormPage
);
routes.post(
	'/upload-form',
	upload.single('file'),
	routeController.postUploadForm
);
routes.post('/add-folder', routeController.postAddFolder);
routes.get('/folder/:folderId', routeController.getIndexPage);
