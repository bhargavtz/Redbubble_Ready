# Redbubble Metadata Generator

This project is a Next.js application designed to generate metadata for Redbubble products. It utilizes AI to help users create compelling titles, descriptions, and tags for their designs.

## Description

The Redbubble Metadata Generator aims to streamline the process of listing products on Redbubble. By leveraging the power of AI, it assists artists and designers in crafting optimized metadata that can improve the visibility and searchability of their work on the platform.

## Features

- 🎨 **AI-Powered Metadata**: Automatically generate optimized titles, descriptions, and tags
- 🎯 **SEO Optimization**: Get metadata that helps your products rank better on Redbubble
- 🖼️ **Design Analysis**: Smart analysis of your artwork to suggest relevant keywords
- ⚡ **Quick Process**: Save time on metadata creation for multiple products
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **AI Integration**: Custom AI implementation with GenKit
- **Form Handling**: React Hook Form with Zod validation

## Project Structure

```typescript
src/
  ├── ai/         # AI implementation and GenKit integration
  ├── app/        # Next.js app router and pages
  ├── components/ # UI components and layouts
  ├── hooks/      # Custom React hooks
  └── lib/        # Utility functions and helpers
```

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:

    ```powershell
    git clone https://github.com/bhargavtz/Redbubble_Ready.git
    cd Redbubble_Ready
    ```

2. Install dependencies:

    ```powershell
    npm install
    ```

3. Start the development server:

    ```powershell
    npm run dev
    ```

    The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linting checks

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is proprietary software. All rights reserved.

## Support

If you encounter any issues or have questions, please open an issue in the repository.


