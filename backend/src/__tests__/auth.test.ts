const BASE_URL = 'http://localhost:8347/api';

describe('Auth API Endpoints', () => {
  test('should send OTP code', async () => {
    const response = await fetch(`${BASE_URL}/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+1234567890' })
    });
    
    expect(response.status).toBe(200);
    // TODO verify that you get a cookie somehow
  });

  test('should fail to get users', async () => {
    const response = await fetch(`${BASE_URL}/users`);
    
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
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
  });
});

// TODO create a series of tests that use auth cookies
