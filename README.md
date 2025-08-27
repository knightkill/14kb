# ⚔️ 14KB Personal Portfolio

A lightning-fast portfolio site with **Bauhaus-inspired design**, intentionally crafted to stay **under 14 KB** of
CSS + JavaScript—built with **Preact**, **HTM**, and a minimalist
**Node.js backend**.

## Run locally with Docker

1. Build the backend image:
   ```bash
   docker build -t knightkill/14kb-api backend
   ```
2. Build the frontend image:
   ```bash
   docker build -t knightkill/14kb-ui frontend
   ```
3. Initialise Docker Swarm (once):
   ```bash
   docker swarm init
   ```
4. Deploy the stack:
   ```bash
   docker stack deploy --with-registry-auth -c swarm-stack.yml 14kb
   ```
5. Visit the services:
   - Frontend: <http://localhost:6969>
   - API health: <http://localhost:8080/health>
6. Tear down when finished:
   ```bash
   docker stack rm 14kb
   docker swarm leave --force
   ```

## Development

### Local Development (without Docker)

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Edit .env with your values
   npm start  # Runs on http://localhost:3000
   ```

2. **Frontend Setup:**
   ```bash
   # From backend directory
   npm run build:ui  # Build the frontend bundle
   
   # Serve frontend (from frontend directory)
   cd ../frontend
   python3 -m http.server 8000  # Or any static server
   # Frontend available at http://localhost:8000
   ```

### Testing & Quality

- From `backend`, run tests and linting:
  ```bash
  npm test           # Run Jest integration tests
  npm run lint       # Run ESLint
  npm run stress-test # Run Artillery load tests
  ```

### Build Process

- The frontend is built using esbuild with external CDN dependencies
- Bundle size is automatically verified to stay under 14KB gzipped
- Bauhaus design uses CSS Grid, custom typography, and geometric elements

### Design Features

**Bauhaus Aesthetic:**
- Geometric typography with Helvetica Neue
- Primary color palette: Red (#E1001A), Blue (#0066CC), Yellow (#FFD700)
- Asymmetrical 3-column grid layout
- Bold borders and functional color coding
- Clean, modernist visual hierarchy

