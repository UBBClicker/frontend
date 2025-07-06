// Development utilities for testing API connectivity
// Open browser console and run these functions to test

// Test basic CORS connectivity
window.testCORS = async function() {
  try {
    const response = await fetch('http://localhost:3001/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ CORS test successful:', data);
      return true;
    } else {
      console.error('❌ CORS test failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ CORS test error:', error);
    return false;
  }
};

// Test API registration
window.testRegister = async function() {
  try {
    const response = await fetch('http://localhost:3001/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nickname: 'testuser' + Date.now(),
        password: 'testpass123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Registration test successful:', data);
      return data;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Registration test failed:', response.status, errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Registration test error:', error);
    return false;
  }
};

// Test API login
window.testLogin = async function(nickname, password) {
  try {
    const formData = new FormData();
    formData.append('username', nickname || 'testuser');
    formData.append('password', password || 'testpass123');
    
    const response = await fetch('http://localhost:3001/user/login', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login test successful:', data);
      return data;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Login test failed:', response.status, errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Login test error:', error);
    return false;
  }
};

// Run all tests
window.runAllTests = async function() {
  console.log('🧪 Starting API tests...');
  
  console.log('\n1. Testing CORS...');
  const corsResult = await testCORS();
  
  if (corsResult) {
    console.log('\n2. Testing registration...');
    const regResult = await testRegister();
    
    if (regResult) {
      console.log('\n3. Testing login...');
      await testLogin(regResult.nickname, 'testpass123');
    }
  }
  
  console.log('\n🏁 Tests completed!');
};

console.log('🔧 API test utilities loaded!');
console.log('Run: testCORS(), testRegister(), testLogin(), or runAllTests()');
