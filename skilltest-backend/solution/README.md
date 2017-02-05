# How to Run

Follow the steps below to run the server in your local machine.

1. Install Node.js & Postgres
2. Run `npm i`
3. Create Postgres database and import tables.sql and data.sql. 
```
createdb skilltest-backend
psql skilltest-backend
\i [path to tables.sql]
\i [path to data.sql]
```
6. Run `npm start` or `npm watch` from project root
7. Open http://localhost:8335

**_Note:_** To run watch nodemon should be globally installed

# Running Tests.

1. Run `npm test` from project root

**_Note:_** To run test mocha should be globally installed

# Project Structure:
**_option.json:_** can be tweaked according to the user requirement

**_server.js:_** root server file

**_package.json:_** it has following scripts:
```
"start": "node ./server.js",
"dev": "nodemon ./server.js",
"test": "mocha ./test/bddTest.js"
```

1. **_test > bddTest.js:_** to run unit test 
2. **_api_routes > apiEngine.js_** to route all api provided in apiList.js with its callback
3. **_api_routes > apiList.js_** List to api's with its callback and method
4. **_common > middleware.js_** Middleware for routes(e.g defining static directories etc.)
5. **_common > processUtil.js_** Watching over process
6. **_module > pgTopUser.js_** Retrieving top user
7. **_module > pgUsers.js_** Retrieving user page
8. **_pgQql > topActiveUsers.sql_** Sql set to get top user
9. **_node_modules_** all packages and its dependencies given in package.json


