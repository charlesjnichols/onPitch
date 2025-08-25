# CONTINUE Project Documentation

## Project Overview

### Purpose
This document provides an overview of the CONTINUE project, including its purpose, key technologies used, and high-level architecture.

### Key Technologies Used
- **React**: For building user interfaces.
- **TypeScript**: For type safety and better developer experience.
- **Vite**: For fast development server and build process.
- **ESLint**: For code linting and quality assurance.

### High-Level Architecture
The project is structured around a React application with TypeScript support. It includes components, utilities, and configuration files to manage the application state and behavior.

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm (or yarn/pnpm)

### Installation Instructions
1. Clone the repository:
   ```bash
git clone https://github.com/your-repo/CONTINUE.git
```
2. Navigate to the project directory:
   ```bash
cd CONTINUE
```
3. Install dependencies:
   ```bash
pnpm install
```
4. Start the development server:
   ```bash
pnpm dev
```

### Usage Examples
- **Running Tests**
  ```bash
pnpm test
```

## Project Structure

### Main Directories and Their Purpose
- `src`: Contains all source code.
- `public`: Static assets like images and fonts.
- `.continue`: Configuration files for the development environment.

### Key Files and Roles
- `src/components/DebugExport.tsx`: Component for exporting debug information.
- `src/components/ErrorBoundary.tsx`: Error boundary component to handle uncaught errors.
- `src/components/PointerTacticsBoard.tsx`: Component for displaying tactics board with pointer interactions.
- `.continue/config.yaml`: Configuration file for the development environment.

### Important Configs
- `.eslintrc.js`: ESLint configuration for TypeScript and React.
- `.gitignore`: Specifies files and directories to ignore in version control.

## Common Tasks

### Step-by-Step for Frequent Dev Tasks
1. **Adding a New Component**
   - Create a new file in `src/components/` with the component name.
   - Import necessary dependencies and extend React.Component or use functional components with hooks.
2. **Running Tests**
   - Use the test runner provided by Vite to run tests:
     ```bash
pnpm test
```
3. **Building for Production**
   - Build the project for production using the following command:
     ```bash
pnpm build
```

## References

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [ESLint Documentation](https://eslint.org/docs/user-guide/getting-started)
