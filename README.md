# T3C Cargo Organiser

A JavaScript browser project with TypeScript support using the Parcel bundler.

## Project Setup

This project is configured with:
- **TypeScript** for type-safe JavaScript development
- **Parcel** for fast bundling and module resolution
- **Modern ES2020** target for browser compatibility

## Available Scripts

### Development
```bash
npm run dev
```
Starts the development server with hot module replacement (HMR). The app will be served at `http://localhost:1234`.

### Production Build
```bash
npm run build
```
Creates an optimized production build in the `dist/` directory.

## Project Structure

```
src/
├── index.html    # HTML entry point
├── index.ts      # TypeScript entry point
└── main.ts       # Main application logic
```

## Configuration Files

- **tsconfig.json** - TypeScript compiler configuration
- **.parcelrc** - Parcel bundler configuration
- **package.json** - Project dependencies and scripts
- **.gitignore** - Git ignore rules

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:1234`

## Building for Production

To create a production build:
```bash
npm run build
```

The optimized output will be in the `dist/` directory.

## Adding Dependencies

To add a new package:
```bash
npm install package-name
```

For development-only packages:
```bash
npm install --save-dev package-name
```

