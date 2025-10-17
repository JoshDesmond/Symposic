const BASE_URL = 'http://localhost:8347/api';

describe('Auth API Endpoints', () => {
  test('should send OTP code', async () => {
    const response = await fetch(`${BASE_URL}/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+1234567890' })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('message');
    console.log('Send code response:', data);
  });

  test('should get users', async () => {
    const response = await fetch(`${BASE_URL}/users`);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    console.log('Users response:', data);
  });

  test('should fail to verify invalid code', async () => {
    const response = await fetch(`${BASE_URL}/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+1234567890', code: '1234567' })
    });
    
    // This should fail with invalid code
    expect(response.status).toBe(422);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    console.log('Verify code response (expected failure):', data);
  });
});
