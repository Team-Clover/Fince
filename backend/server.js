import http from 'http';
import app from './app.js';
const port = process.env.PORT || 5000;

const server = http.createServer(app);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n Port ${port} is already in use. Run this to fix it:\n   npx kill-port ${port}\nThen restart the server.\n`);
    process.exit(1);
  } else {
    throw err;
  }
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});