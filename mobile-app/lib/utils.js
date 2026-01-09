import { Platform } from 'react-native';

// Replace with your machine's local IP if testing on physical device
// For Android Emulator, use 10.0.2.2
// For iOS Simulator, localhost works
const DEV_API_URL = Platform.select({
  android: 'http://10.0.2.2:8000',
  ios: 'http://localhost:8000',
  default: 'http://localhost:8000',
});

// Production URL (Wishbook Vercel App Backend - likely same domain or separate)
// You provided https://wishbook-frontend.vercel.app as frontend. 
// Backend might be on Render/Heroku/Vercel. 
// For now, we defaults to DEV or a placeholder PROD.
const PROD_API_URL = 'https://your-backend-url.com'; 

export const getApiUrl = (path) => {
  // Simple check for dev mode. __DEV__ is a global in RN.
  const baseUrl = __DEV__ ? DEV_API_URL : PROD_API_URL;
  return `${baseUrl}${path}`;
};
