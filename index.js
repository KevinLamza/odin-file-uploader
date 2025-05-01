import 'dotenv/config';
import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
	const allUsers = await prisma.users.findMany();
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
	res.send('Hello World!');
});

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}`);
});
