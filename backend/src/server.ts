// server.ts - TEMPORARY TEST
import http from 'http';
const port = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Infrastructure Test: OK');
});

server.listen(port, () => {
  console.log(`Test server running on ${port}`);
});
