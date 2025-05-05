import 'dotenv/config';
import * as path from 'path';
import { fileURLToPath } from 'url';
// import { Pool } from 'pg'; might be unnecessary, because of prisma-session-store
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';

const PORT = process.env.PORT || 3000;

const app = express();
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const prisma = new PrismaClient();

app.use(
	session({
		cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
		secret: 'cats',
		resave: true,
		saveUninitialized: true,
		store: new PrismaSessionStore(new PrismaClient(), {
			checkPeriod: 2 * 60 * 1000,
			dbRecordIdIsSessionId: true,
			dbRecordIdFunction: undefined,
		}),
	})
);
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

passport.use(
	new LocalStrategy(async (username, password, done) => {
		try {
			const user = await prisma.users.findUnique({
				where: { name: username },
			});

			if (!user) {
				return done(null, false, { message: 'Incorrect username' });
			}
			const match = await bcrypt.compare(password, user.password);
			if (!match) {
				return done(null, false, { message: 'Incorrect password' });
			}
			return done(null, user);
		} catch (err) {
			return done(err);
		}
	})
);

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await prisma.users.findUnique({ where: { id: id } });

		done(null, user);
	} catch (err) {
		done(err);
	}
});

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

app.get('/', (req, res) => {
	res.render('index', { user: req.user });
});

app.get('/sign-up-form', (req, res) => res.render('sign-up-form'));

app.post('/sign-up-form', async (req, res, next) => {
	try {
		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		await prisma.users.create({
			data: { name: req.body.username, password: hashedPassword },
		});
		res.redirect('/');
	} catch (err) {
		return next(err);
	}
});

app.post(
	'/log-in',
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/',
	})
);

app.get('/log-out', (req, res, next) => {
	req.logout((err) => {
		if (err) {
			return next(err);
		}
		res.redirect('/');
	});
});

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}`);
});
