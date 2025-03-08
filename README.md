## Setup instructions

### 1. Install dependencies

- Assuming you are at root directory of the project, run the following commands to install all the dependencies for both frontend and backend:

```
npm install
cd client
npm install
cd ..
```

### 2. Setup environment variables

- Using the .env file in the root directory, update the values with working URL for mongodb.

### 3. Run the application

- Run both frontend and backend servers using the command below:

```
npm run dev
```

### 4. Run test cases

- Run test cases using the command below:

```
npm run test
```

## CI Runs (Milestone 1)

### PR CI run

- Runs unit tests for frontend and backend on commit to PR ([Link](https://github.com/cs4218/cs4218-2420-ecom-project-team40/actions/runs/13562684530/job/37908876002))

### Merge CI run

- Runs unit tests for frontend and backend on merge ([Link](https://github.com/cs4218/cs4218-2420-ecom-project-team40/actions/runs/13561597834/job/37905628715))

### Deploy CI run

- Builds and Deploys after merge ([Link](https://github.com/cs4218/cs4218-2420-ecom-project-team40/actions/runs/13561597831/job/37905628718))
