# Smart Grocery App

Smart Grocery App is a full-stack application designed to help households manage grocery lists, inventories, and notifications efficiently. It consists of a Node.js/Express backend and a React/Vite frontend.

## Features
- User authentication and household management
- Grocery list creation and management
- Inventory tracking
- Notification system for reminders and updates
- Responsive web interface

## Project Structure
```
smart-grocery/
├── api/        # Backend (Node.js/Express)
├── web/        # Frontend (React/Vite)
├── docker-compose.yml
```

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm
- (Optional) Docker for containerized setup

### Backend Setup (API)
1. Navigate to the backend folder:
	```sh
	cd smart-grocery/api
	```
2. Install dependencies:
	```sh
	npm install
	```
3. Start the backend server:
	```sh
	npm start
	```
	The API will run on the configured port (default: 3000).

### Frontend Setup (Web)
1. Navigate to the frontend folder:
	```sh
	cd smart-grocery/web
	```
2. Install dependencies:
	```sh
	npm install
	```
3. Start the development server:
	```sh
	npm run dev
	```
	The app will be available at [http://localhost:5173](http://localhost:5173) by default.

### Docker Setup (Optional)
To run both frontend and backend using Docker Compose:
1. From the project root:
	```sh
	docker-compose up
	```

## Folder Overview
- **api/**: Express backend source code
- **web/**: React frontend source code
- **docker-compose.yml**: Multi-container orchestration

## Environment Variables
- Backend: Configure database and JWT secrets in `api/src/config/db.js` or via environment variables.
- Frontend: API endpoint configuration in `web/src/api/client.js`.

## License
This project is licensed under the MIT License.
# Smart-Grocery


