/**
 * AWS Amplify Configuration
 * 
 * Configures Amplify to use your existing Cognito User Pool
 * with enhanced role-based authentication support
 */

const amplifyConfig = {
  Auth: {
    Cognito: {
      // Amazon Cognito Region
      region: process.env.REACT_APP_COGNITO_REGION,
      
      // Amazon Cognito User Pool ID
      userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
      
      // Amazon Cognito Web Client ID
      userPoolClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
      
      // Hosted UI configuration with role-based redirects
      loginWith: {
        oauth: {
          domain: process.env.REACT_APP_COGNITO_DOMAIN,
          scopes: ['email', 'openid', 'phone', 'profile'],
          redirectSignIn: ['http://localhost:3000/auth/callback'],
          redirectSignOut: ['http://localhost:3000/'],
          responseType: 'code'
        }
      }
    }
  }
};

export default amplifyConfig;
