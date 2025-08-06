# ⚔️ 14KB Personal Portfolio

A lightning-fast portfolio site, intentionally crafted to stay **under 14 KB** of
CSS + JavaScript—built with **Milligram**, **Alpine.js**, and a minimalist
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
   - Frontend: <http://localhost>
   - API health: <http://localhost:8080/health>
6. Tear down when finished:
   ```bash
   docker stack rm 14kb
   docker swarm leave --force
   ```

## Development

- Copy `backend/.env.example` to `backend/.env` and fill in environment values.
- From `backend`, run tests and linting:
  ```bash
  npm test
  npm run lint -- --fix
  ```

