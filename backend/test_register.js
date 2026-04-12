import http from 'http';

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('RESPONSE:', res.statusCode, body));
});

req.on('error', e => console.error('ERROR (Is backend running?):', e));
req.write(JSON.stringify({username:"test3", email:"test3@test.com", password:"123"}));
req.end();
