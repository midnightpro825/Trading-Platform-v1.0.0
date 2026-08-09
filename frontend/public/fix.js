// ============================================================
// SIMPLE FIX - RUN THIS IN BROWSER CONSOLE
// ============================================================

// Check if user exists in localStorage
console.log('📦 Checking localStorage...');
const savedUser = localStorage.getItem('user');
const token = localStorage.getItem('token');

console.log('User:', savedUser);
console.log('Token:', token);

if (savedUser) {
    try {
        const user = JSON.parse(savedUser);
        console.log('✅ User found:', user);
        console.log('👤 Name:', user.name);
        console.log('🆔 ID:', user.id);
    } catch (e) {
        console.error('❌ Error parsing user:', e);
    }
} else {
    console.log('❌ No user found in localStorage');
}

// Test registration
async function testRegister() {
    console.log('📝 Testing registration...');
    
    try {
        const response = await fetch('http://localhost:8081/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Console Test',
                email: 'console@test.com',
                password: 'password123',
                username: 'consoletest'
            })
        });
        
        const data = await response.json();
        console.log('📡 Response:', data);
        
        if (data.success) {
            console.log('✅ Registration successful!');
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            console.log('💾 User saved to localStorage');
            console.log('👤 User:', data.user);
        } else {
            console.log('❌ Registration failed:', data.message);
        }
    } catch (error) {
        console.error('❌ Error:', error);
        console.log('Make sure backend is running on port 8081');
    }
}

// Run test
console.log('');
console.log('🔥 To test registration, run: testRegister()');
console.log('');
