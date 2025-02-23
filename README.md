# Interactive Podcast Experience

An innovative web application that transforms passive podcast listening into an interactive learning experience.

## Features

- **Interactive Audio Player**
  - Glass-morphism design
  - Transcript synchronization
  - Note-taking capabilities
  - Time-stamped navigation

- **Voice Interaction (Beta)**
  - Join conversations with podcast hosts
  - AI-powered responses using Eleven Labs
  - Real-time voice processing

- **Educational Content**
  - Curated podcast library
  - Educational course integration
  - Interactive transcripts
  - Smart note-taking system

## Technology Stack

- **Frontend Framework**
  - React
  - TypeScript
  - Vite

- **Styling**
  - Tailwind CSS
  - shadcn/ui components
  - Glass-morphism effects

- **AI Integration**
  - Eleven Labs Voice AI
  - Real-time speech processing
  - Natural language understanding

## Getting Started

1. Clone the repository
```sh
git clone <repository-url>
```

2. Install dependencies
```sh
npm install
```

3. Set up environment variables
```sh
# Create a .env file with:
VITE_ELEVEN_LABS_API_KEY=your_api_key
```

4. Start the development server
```sh
npm run dev
```

## Project Structure

- `/src/components` - React components including AudioPlayer and TranscriptDisplay
- `/src/contexts` - React contexts for state management
- `/src/data` - Mock data and content
- `/src/types` - TypeScript type definitions
- `/src/pages` - Page components and routing

## Current Status

The project is in beta, with some features limited to specific content:
- Full interaction available on the main podcast
- Voice interaction and transcript features in testing
- Educational content integration in alpha stage

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
