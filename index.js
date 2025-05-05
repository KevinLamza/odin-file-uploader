import 'dotenv/config';
import * as path from 'path';
import { fileURLToPath } from 'url';
import express from 'express'; // e austesten
import session from 'express-session';
import passport from 'passport';
import { PrismaClient } from '@prisma/client';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { routes } from './routes/routes';

// const storage = multer.diskStorage({
// 	destination: function (req, file, cb) {
// 		cb(null, '/home/kevin/repositories/uploads');
// 	},
// 	filename: function (req, file, cb) {
// 		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
// 		cb(null, file.fieldname + '-' + uniqueSuffix);
// 	},
// });

// const upload = multer({ storage: storage });

const PORT = process.env.PORT || 3000;

// SETUP EXPRESS AND PRISMA
const app = express();
const prisma = new PrismaClient();

// PARSER TO HANDLE FORM DATA IN FORM REQUESTS
app.use(express.urlencoded({ extended: false }));

// SETUP VIEWS
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// INITIALIZE SESSION
app.use(
	session({
		cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
		secret: 'cats',
		resave: true,
		saveUninitialized: true,
		store: new PrismaSessionStore(prisma, {
			checkPeriod: 2 * 60 * 1000,
			dbRecordIdIsSessionId: true,
			dbRecordIdFunction: undefined,
		}),
	})
);

// MAKE PASSPORT USE THE INITIALIZED SESSION
// MUST BE AFTER SESSION MIDDLEWARE AND BEFORE ROUTE MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

// ROUTES
app.use('/', routes);

async function main() {
	const allUsers = await prisma.users.findMany();
	// const allUsers = await prisma.users.create({
	// 	data: {
	// 		name: 'Michi',
	// 		password: '789',
	// 	},
	// });
	console.log(allUsers);
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});

// ERROR HANDLING
app.use((err, req, res, next) => {
	// next löschen?
	console.error(err.stack);
	res.status(500).send('Something went wrong!');
});

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}`);
});
