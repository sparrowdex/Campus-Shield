# Getting Started

# Getting Started with CampusShield

Welcome to CampusShield! This guide will walk you through the steps to get the project up and running on your local machine. Follow these instructions to set up the development environment and start exploring the application.

## Prerequisites

Before you begin, ensure you have the following software and tools installed:

- **Node.js**: Version 16 or higher. You can download it from [nodejs.org](https://nodejs.org/).
- **MongoDB**: Version 5 or higher. You can install it locally or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for a cloud-based solution.
- **Git**: Optional, but recommended for version control. Download from [git-scm.com](https://git-scm.com/).

### System Requirements

- Operating System: Windows, macOS, or Linux
- RAM: At least 4GB
- Disk Space: Minimum 500MB free space for the repository and dependencies

### Account Setup

- If using MongoDB Atlas, create an account and set up a database cluster.

## Installation

Clone the repository and install the necessary dependencies:

```bash
# Clone the repository
git clone https://github.com/yourusername/campus-shield.git
cd campus-shield

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

## Quick Setup

Set up your environment and start the application:

1. **Environment Variables**: Copy the example environment files to configure your settings.
   ```bash
   # In the server directory
   cp .env.example .env

   # In the client directory
   cd ../client
   cp .env.example .env
   ```

2. **Start MongoDB**: Ensure MongoDB is running locally or configure your connection string for MongoDB Atlas in the `.env` files.

3. **Start the Backend**:
   ```bash
   cd ../server
   npm start
   ```

4. **Start the Frontend**:
   ```bash
   cd ../client
   npm start
   ```

5. **Access the Application**: Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## First Steps

- **Verify Installation**: Ensure both the backend and frontend servers are running without errors.
- **Basic Usage**: Explore the application interface and test basic functionalities.
- **Development Workflows**: Use Chrome DevTools to test mobile responsiveness.

## Development Environment

### Key Directories and Files

- **server/**: Contains the backend code using Node.js and Express.js.
- **client/**: Contains the frontend code using React and TypeScript.
- **.env**: Configuration files for environment variables.

### Development Server Startup

- **Backend**: Use `npm start` in the `server/` directory.
- **Frontend**: Use `npm start` in the `client/` directory.

### Testing Setup

- Ensure your environment variables are correctly set up for testing.
- Use `npm test` in both `server/` and `client/` directories for running tests.

## Next Steps

- **Documentation**: Explore the codebase and documentation for more detailed information on each component.
- **Common Tasks**: Learn about deploying the application, integrating new features, and contributing to the project.
- **Troubleshooting**: Check logs for errors and consult the community or documentation for solutions.

By following these steps, you should be able to set up and start working with CampusShield efficiently. Happy coding!