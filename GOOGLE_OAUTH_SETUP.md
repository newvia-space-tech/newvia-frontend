# Google OAuth Setup Instructions

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# Backend API Configuration
NEXT_PUBLIC_BACKEND_API_URL=https://your-backend-api.com/api

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set the application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)
7. Copy the Client ID and add it to your `.env.local` file

## Backend Setup

Your backend should have the following endpoints:

### POST /auth/google/callback
```json
{
  "code": "authorization_code_from_google",
  "redirect_uri": "http://localhost:3000/auth/callback"
}
```

**Response:**
```json
{
  "authToken": "jwt_token_here",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

### GET /auth/me
**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "id": 123,
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://example.com/avatar.jpg"
}
```

## Testing the Implementation

1. Start your development server: `npm run dev`
2. Navigate to `/auth/login`
3. Click "Continue with Google"
4. Complete the OAuth flow in the popup
5. Verify that you're redirected to the protected area
6. Check that user data is displayed correctly
7. Test logout functionality

## Security Features

- ✅ Origin verification for postMessage
- ✅ Token validation on app mount
- ✅ Auto-logout on 401 responses
- ✅ Secure popup window handling
- ✅ Error handling and user feedback
- ✅ Token storage in localStorage

## Troubleshooting

### Popup Blocked
- Ensure popups are allowed for your domain
- Check browser popup blocker settings

### CORS Issues
- Verify your backend API URL is correct
- Check that your domain is whitelisted in your backend

### Token Validation Fails
- Ensure your backend `/auth/me` endpoint is working
- Check that the token format is correct
- Verify the Authorization header is being sent properly

### Google OAuth Errors
- Verify your Client ID is correct
- Check that redirect URIs match exactly
- Ensure the Google+ API is enabled
