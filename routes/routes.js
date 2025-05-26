import { Router } from 'express';
import * as authentificationController from '../controllers/authentificationController.js';
import {
	validateUser,
	validateFolderName,
} from '../controllers/validationController.js';
import * as routeController from '../controllers/routeController.js';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

export const routes = Router();

routes.get(
	'/',
	routeController.getIndexPage,
	authentificationController.isAuthenticated,
	routeController.getFolderPage
);
routes.get(
	'/folder/:folderId',
	authentificationController.isAuthenticated,
	routeController.getFolderPage
);
routes.get(
	'/file/:fileId',
	authentificationController.isAuthenticated,
	routeController.getFilePage
);

routes.post('/add-folder', validateFolderName, routeController.postAddFolder);
routes.post('/delete-folder', routeController.postDeleteFolder);
routes.get('/renameFolder/:folderId', routeController.getRenameFolderPage);
routes.post(
	'/rename-folder',
	validateFolderName,
	routeController.postRenameFolder
);

routes.get('/sign-up-form', routeController.getCreateUser);
routes.post('/sign-up-form', validateUser, routeController.postCreateUser);
routes.post(
	'/log-in',
	authentificationController.authenticateUser,
	routeController.getFolderPage
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

routes.get(
	'/download/:fileId',
	authentificationController.isAuthenticated,
	routeController.getDownloadFile
);

routes.get(
	'/{*catchall}',
	authentificationController.isAuthenticated,
	routeController.getFolderPage
);
