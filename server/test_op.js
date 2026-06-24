async function test() {
  try {
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

    const opRes = await fetch('http://localhost:5000/api/opportunities', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        title: "Test Opportunity",
        type: "Placement Drive",
        companyName: "Google"
      })
    });

    const opData = await opRes.json();
    console.log("Status:", opRes.status);
    console.log("Response:", opData);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
