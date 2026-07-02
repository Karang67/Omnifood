# Omnifood Full Stack App

## Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in values in `.env`:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - Optional: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

3. Install server dependencies:
   ```bash
   npm install
   ```

4. Install client dependencies:
   ```bash
   cd client
   npm install
   cd ..
   ```

4. Install the client environment sample:
   ```bash
   cd client
   cp .env.example .env
   cd ..
   ```

5. Build client assets:
   ```bash
   cd client
   npm run build
   cd ..
   ```

6. Start the server:
   ```bash
   npm start
   ```

## Notes

- The server uses MongoDB and requires a valid `MONGO_URI`.
- If you do not configure Cloudinary, image uploads will still use local fallback storage.
- Google Auth in the client defaults to a built-in test client ID but should be replaced with `VITE_GOOGLE_CLIENT_ID` in production.
- Production mode requires `JWT_SECRET` to be set.
