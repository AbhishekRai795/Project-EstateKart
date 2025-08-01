# EstateKart Frontend Project Structure

## 1. Overview

This document outlines the project structure for the EstateKart frontend. The application is a modern web platform for real estate, built using **React**, **TypeScript**, and **Vite**. It leverages **Tailwind CSS** for styling and is integrated with **AWS Amplify** for backend services, including authentication, data management (database), and file storage.

The architecture is feature-driven and role-based, clearly separating concerns for different types of users (e.g., property listers and regular users).

### Key Technologies:
- **Framework**: React (v18+) with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend-as-a-Service**: AWS Amplify (Auth, Data, Storage)
- **Routing**: React Router (inferred)
- **State Management**: React Context API & Custom Hooks
- **Linting**: ESLint

---

## 2. Directory & File Breakdown

### Root Directory

- **`.gitignore`**: Specifies files and directories for Git to ignore.
- **`package.json`**: Defines project metadata, dependencies, and scripts (`dev`, `build`, `lint`).
- **`vite.config.ts`**: Configuration file for the Vite build tool.
- **`tailwind.config.js`**: Configuration for the Tailwind CSS framework.
- **`postcss.config.js`**: Configuration for PostCSS, used by Tailwind.
- **`tsconfig.*.json`**: TypeScript compiler configuration files.
- **`index.html`**: The main HTML entry point for the application.
- **`.amplify/` & `amplify/`**: Contain AWS Amplify generated configurations and backend-as-code definitions (`resource.ts` files for auth, data, storage).
- **`amplify_outputs.json`**: Generated file containing the outputs of your Amplify backend deployment (e.g., API endpoints, auth IDs). **Do not commit this file if it contains sensitive data.**
- **`src/`**: The main directory containing all the application's source code.

### `src/` Directory

- **`main.tsx`**: The application's entry point. It renders the root `App` component into the DOM.
- **`App.tsx`**: The root component of the application. It likely sets up the main router and global contexts.
- **`index.css`**: Global CSS styles and Tailwind CSS imports.

- **`components/`**: Contains reusable React components shared across the application.
  - `analytics/`: Components specifically for displaying analytics data (e.g., charts, stats cards).
  - `common/`: General-purpose components used everywhere (e.g., `Header`, `PropertyCard`, `SearchBar`).

- **`contexts/`**: Holds React Context providers for global state management.
  - `AuthContext.tsx`: Manages user authentication state (e.g., current user, login/logout functions).
  - `PropertyContext.tsx`: Manages state related to properties, possibly caching data to avoid redundant fetches.

- **`hooks/`**: Custom React hooks to encapsulate and reuse stateful logic.
  - `useProperties.ts`, `useCatalogue.ts`: Hooks for fetching and managing property data from the backend.

- **`lib/`**: Contains library initializations and configurations.
  - `amplifyConfig.ts`: Configures and initializes the AWS Amplify library with credentials from `amplify_outputs.json`.

- **`pages/`**: Contains top-level components that represent a full page or view, mapped to specific routes.
  - `Landing.tsx`: The initial landing page for visitors.
  - `PropertyDetail.tsx`: The detailed view for a single property.
  - `auth/`: Pages related to authentication (Login, Sign Up, Forgot Password).
  - `lister/`: A sub-application for the "Lister" user role (e.g., real estate agents). Contains its own dashboard, property management, and analytics pages.
  - `user/`: A sub-application for the "User" role (e.g., buyers, renters). Contains its own dashboard, property catalogue, favorites, and profile pages.

- **`routes/`**: Defines the application's routing logic.
  - `AppRouter.tsx`: Uses a library like `react-router-dom` to map URL paths to the page components in `pages/`. It likely includes logic for protected routes based on authentication status from `AuthContext`.

- **`services/`**: Modules responsible for communicating with external APIs and services.
  - `propertyService.ts`: Contains functions for all property-related CRUD (Create, Read, Update, Delete) operations, interacting with the Amplify DataStore or API.
  - `userPreferenceService.ts`: Manages user-specific data like preferences and favorites.

- **`utils/`**: Contains utility functions that can be used anywhere in the application.
  - `imageValidation.ts`: Helper functions for client-side image validation (e.g., checking size, type).

---

## 3. Workflows

### User Authentication Workflow
1.  A new user lands on `pages/Landing.tsx`.
2.  They navigate to the `pages/auth/Auth.tsx` page to sign up or log in.
3.  The `Auth.tsx` component uses AWS Amplify functions (configured via `lib/amplifyConfig.ts`) to handle the authentication process.
4.  Upon successful login, the `AuthContext` is updated with the user's session and data.
5.  The `AppRouter` detects the authenticated state and grants access to protected routes (e.g., `/user/dashboard` or `/lister/dashboard`).

### Data Flow & User Interaction (User Role)
1.  A logged-in user is redirected to their dashboard at `pages/user/Dashboard.tsx`.
2.  The user navigates to the property catalogue (`pages/user/Catalogue.tsx`).
3.  The `Catalogue` component calls the `useCatalogue` hook.
4.  The hook in turn calls a function from `services/propertyService.ts` to fetch a list of properties from the AWS backend.
5.  The properties are displayed using the reusable `components/common/PropertyCard.tsx` component.
6.  The user can click on a card to navigate to `pages/PropertyDetail.tsx`, which fetches detailed information for that specific property.

### Data Flow & Lister Interaction (Lister Role)
1.  A logged-in lister is redirected to their dashboard at `pages/lister/Dashboard.tsx`.
2.  The lister navigates to `pages/lister/AddProperty.tsx` to create a new listing.
3.  The form on this page collects property details and images. The images may be validated client-side using functions from `utils/imageValidation.ts`.
4.  On submission, the form calls a function in `services/propertyService.ts` which:
    a. Uploads images to AWS S3 via Amplify Storage.
    b. Saves the property details (including image URLs) to the database via Amplify Data.
5.  The lister can view their active properties on `pages/lister/Properties.tsx` and check their performance on `pages/lister/Analytics.tsx`.
