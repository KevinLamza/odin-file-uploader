import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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

export const authenticateUser = function (req, res, next) {
	passport.authenticate('local', function (err, user, info) {
		if (err) {
			return next(err);
		}
		if (!user) {
			console.log(info.message);
			return res.render('index', { errors: [{ msg: info.message }] });
		}

		// NEED TO CALL req.login()!!!
		req.login(user, next);
	})(req, res, next);
};

export const isAuthenticated = (req, res, next) => {
	if (req.user) {
		next();
	} else {
		res.redirect('/');
	}
};

export const logOut = (req, res, next) => {
	if (req.user) {
		req.logout(function (err) {
			if (err) {
				return next(err);
			}
			res.redirect('/');
		});
	} else {
		res.redirect('/');
	}
};
