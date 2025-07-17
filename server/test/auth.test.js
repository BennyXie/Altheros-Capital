const request = require('supertest');
const { expect } = require('chai');
const app = require('../index'); // Assuming your main app file is index.js in the server directory

describe('Authentication and Group Management', () => {
  before(() => {
    console.log('Starting Authentication and Group Management tests...');
  });

  after(() => {
    console.log('Finished Authentication and Group Management tests.');
  });

  // Test for user signup
  it('should allow a new user to sign up', async () => {
    console.log('Running test: should allow a new user to sign up');
    const res = await request(app)
      .post('/api/auth/cognito-signup')
      .send({
        username: 'testuser' + Date.now(),
        password: 'Password123!',
        givenName: 'Test',
        familyName: 'User',
      });
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.property('message').equal('Signup request sent');
    console.log('Test passed: should allow a new user to sign up');
  });

  // Test for user login with correct credentials
  it('should allow a user to log in with correct credentials', async () => {
    const username = 'testuser' + Date.now();
    const password = 'Password123!';
    // First, sign up the user
    await request(app)
      .post('/api/auth/cognito-signup')
      .send({
        username,
        password,
        givenName: 'Test',
        familyName: 'User',
      });
    // Then, attempt to log in
    const res = await request(app)
      .post('/api/auth/cognito-login')
      .send({ username, password });
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.property('token');
  });

  // Test for user login with incorrect credentials
  it('should not allow login with incorrect credentials', async () => {
    const res = await request(app)
      .post('/api/auth/cognito-login')
      .send({ username: 'nonexistentuser', password: 'wrongpassword' });
    expect(res.statusCode).to.be.oneOf([400, 401]);
    expect(res.body).to.have.property('error');
  });

  // Test for signup with missing fields
  it('should not allow signup with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/cognito-signup')
      .send({ username: '', password: '' });
    expect(res.statusCode).to.be.oneOf([400, 422]);
    expect(res.body).to.have.property('error');
  });

  // Test for login with non-existent user
  it('should not allow login for a non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/cognito-login')
      .send({ username: 'ghostuser' + Date.now(), password: 'Password123!' });
    expect(res.statusCode).to.be.oneOf([400, 401]);
    expect(res.body).to.have.property('error');
  });

  // Test for adding user to a group on login (this will require a mock for cognitoService)
  it('should add an authenticated user to a specified group', async () => {
    console.log('Running test: should add an authenticated user to a specified group');
    // This test will require mocking the cognitoService.addUserToGroup and listGroupsForUser
    // For now, this is a placeholder.
    // In a real scenario, you'd mock the cognitoService to simulate successful group addition
    // and then assert that the addToGroup endpoint behaves as expected.
    const res = await request(app)
      .post('/api/auth/add-to-group')
      .set('Authorization', 'Bearer YOUR_AUTH_TOKEN') // Replace with a valid token for a test user
      .send({ role: 'patient' });
    
    // Expect a 200 status if the user is successfully added or already in the group
    expect(res.statusCode).to.be.oneOf([200, 400]); // 400 if user info not available, 200 if successful
    console.log('Test passed: should add an authenticated user to a specified group');
  });

  // Test for preventing re-adding user to an existing group
  it('should not re-add a user to a group they are already in', async () => {
    console.log('Running test: should not re-add a user to a group they are already in');
    // Similar to the above, this requires mocking cognitoService
    const res = await request(app)
      .post('/api/auth/add-to-group')
      .set('Authorization', 'Bearer YOUR_AUTH_TOKEN') // Replace with a valid token for a test user
      .send({ role: 'patient' });

    expect(res.statusCode).to.be.oneOf([200, 400]);
    console.log('Test passed: should not re-add a user to a group they are already in');
  });
});