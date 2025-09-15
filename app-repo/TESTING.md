Testing overview for RMIT E-commerce (MERN)

What’s included
- Backend unit test: validates store product query builder.
- Backend integration test: spins up in-memory MongoDB and hits `/api/product/list`.
- Frontend unit/UI tests: React component rendering (ProductList) and Cart reducer logic.
- E2E browser tests (Playwright): verifies shop lists products and product page loads.

Install dependencies
- Root: `npm install`
- Or individually:
  - Server: `npm --prefix ./server install`
  - Client: `npm --prefix ./client install`

Run tests
- All tests: `npm test`
- Server only: `npm --prefix ./server test`
- Client only: `npm --prefix ./client test`
- E2E (Playwright):\n  - Flows: shop listing + product page, login/logout
  - Seed DB first (once): `npm --prefix ./server run seed:db admin@rmit.edu.vn mypassword`
  - Run: `npm run e2e` (headed: `npm run e2e:headed`). The config auto-starts servers if not already running.
  - Report: `npm run e2e:report`
  - If you already started servers manually (ports 3000 and 8080 in use), skip auto-start:
    - Headless: `npm run e2e:external`
    - Headed: `npm run e2e:headed:external`

Files of interest
- Server Jest config: `app-repo/server/jest.config.js`
- Server tests:
  - Unit: `app-repo/server/tests/unit/queries.test.js`
  - Integration: `app-repo/server/tests/integration/products.e2e.test.js`
- Frontend Jest config: `app-repo/client/jest.config.js`
- Frontend tests:
  - UI: `app-repo/client/app/components/Store/ProductList/ProductList.test.jsx`
  - Reducer: `app-repo/client/app/containers/Cart/reducer.test.js`

Notes
- Server tests do not require a running MongoDB; they use an in-memory instance.
- For `GET /api/product/list`, the route expects a `sortOrder` query param that parses as JSON. Tests pass `{}`.
- Frontend tests run in jsdom and do not require the dev server.
- E2E tests expect the running app and seeded products; otherwise they fail with a helpful message.

