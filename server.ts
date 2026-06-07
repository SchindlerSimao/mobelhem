import { createServer } from 'http';
import { Server } from 'socket.io';
import { handler } from './build/handler.js';
import { setupSockets } from './src/lib/server/socket';
import { initializeDatabase } from './src/lib/server/db';

const server = createServer(handler);
const io = new Server(server);

async function startServer() {
	await initializeDatabase();
	setupSockets(io);

	const port = process.env.PORT || 3000;
	server.listen(port, () => {
		console.log(`Server listening on port ${port}`);
	});
}

startServer().catch((err) => {
	console.error('Failed to start server:', err);
	process.exit(1);
});
