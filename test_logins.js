const http = require('http');

function testLogin(empId, password) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ rollNoOrEmpId: empId, password: password });
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      },
      (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            const json = JSON.parse(body);
            console.log(`✅ Login success for ${empId}: Role -> ${json.user.role}`);
            resolve(json.token);
          } else {
            console.log(`❌ Login failed for ${empId}: ${res.statusCode} - ${body}`);
            resolve(null);
          }
        });
      }
    );

    req.on('error', (e) => {
      console.log(`❌ Connection failed for ${empId}: ${e.message}`);
      resolve(null);
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('--- Testing Logins ---');
  await testLogin('ADMIN001', 'Student@123');
  await testLogin('25B21CS051', 'Radha@2787');
  await testLogin('D001', 'Dean@123');
  await testLogin('FAC001', 'Faculty@123');
}

runTests();
