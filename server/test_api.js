async function test() {
  try {
    // 1. Login as admin
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@campx.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log("Logged in!");

    // 2. Request users
    const usersRes = await fetch('http://localhost:5000/api/admin/users?role=student&branch=CSE&currentYear=1&status=not_verified&page=1&limit=20', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const usersData = await usersRes.json();
    console.log("Users returned:", usersData.users ? usersData.users.length : usersData);
    if (usersData.users && usersData.users.length > 0) {
      console.log("First user:", usersData.users[0]);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
