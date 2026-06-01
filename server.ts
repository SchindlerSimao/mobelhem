import { createServer } from 'http';
import { Server } from 'socket.io';
import { handler } from './build/handler.js';
import { setupSockets } from './src/lib/server/socket';

const server = createServer(handler);
const io = new Server(server);

// Set up multiplayer game room sockets
setupSockets(io);

const port = process.env.PORT || 3000;
server.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
