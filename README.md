# Möbelhem

A multiplayer geography trivia game about IKEA furniture and Scandinavian cities. Test your knowledge of Nordic culture while competing with friends in real-time.

## Features

- **Solo Mode**: Classic trivia gameplay with timing challenges
- **Multiplayer Mode**: Real-time competitive gameplay with friends (up to 4 players)
- **Leaderboard**: Track your high scores across different game modes
- **Rich Content**: A lot of words covering IKEA furniture series and Scandinavian cities
- **Geographic Knowledge**: Learn about Sweden, Norway, Denmark, and Finland

## Tech Stack

- **Frontend**: Svelte 5, SvelteKit, TailwindCSS 4
- **Backend**: Node.js, Socket.IO for real-time multiplayer
- **Database**: SQLite with Drizzle ORM
- **Testing**: Vitest (unit), Playwright (E2E)
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone git@github.com:SchindlerSimao/mobelhem.git
cd mobelhem

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
```

### Database Setup

```bash
# Run database migrations
pnpm db:migrate

# Seed the database with words (optional, auto-runs on first start)
pnpm db:push
```

### Development

```bash
# Start the development server
pnpm dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Docker

```bash
# Build the image
docker build -t mobelhem .

# Run with a fresh database (auto-migrates and seeds)
docker run -p 3000:3000 mobelhem

# Run with a persistent database
docker run -p 3000:3000 -v ./data:/app/data -e DATABASE_URL=data/local.db mobelhem

# Run with an existing database file
# Add :z on SELinux systems (Fedora/RHEL)
docker run -p 3000:3000 -v ./database.sqlite:/app/local.db:z mobelhem
```

## Game Rules

### Solo Mode

- You have 60 seconds to answer as many questions as possible
- Correct answers give you +2 seconds and 100 points
- "Both" type words (IKEA + City) give +150 points
- Wrong answers cost you 5 seconds

### Multiplayer Mode

- Create or join a room with a 6-character code
- 10 rounds per game, 8 seconds per question
- First to answer correctly gets the most points
- Speed bonus for quick correct answers
- Room expires after 30 minutes of inactivity

## Testing

```bash
# Run unit tests
pnpm test:unit

# Run E2E tests
pnpm test:e2e

# Run all tests
pnpm test
```

## Project Structure

```
mobelhem/
├── src/
│   ├── lib/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── features/    # Feature-specific components
│   │   │   └── ui/          # Base UI components
│   │   ├── config/          # Game configuration constants
│   │   ├── server/          # Backend logic
│   │   │   ├── db/          # Database schema and seeders
│   │   │   └── game/        # Game logic and room management
│   │   └── utils/           # Utility functions
│   └── routes/              # SvelteKit pages and API routes
├── tests/                   # E2E test files
├── drizzle/                 # Database migrations
├── words.csv                # Game data source
└── server.ts                # Custom server with Socket.IO
```

## Game Data

The game uses a CSV file (`words.csv`) containing:

- **IKEA**: Famous furniture series (BILLY, POANG, MALM, etc.)
- **Cities**: Major Scandinavian cities (Stockholm, Oslo, Copenhagen, etc.)
- **Both**: Names that are both IKEA products and real places

Each entry includes descriptions, geographic coordinates, and fun facts.

## Available Scripts

| Command            | Description                      |
| ------------------ | -------------------------------- |
| `pnpm dev`         | Start development server         |
| `pnpm build`       | Build for production             |
| `pnpm preview`     | Preview production build         |
| `pnpm check`       | Run TypeScript and Svelte checks |
| `pnpm lint`        | Run ESLint and Prettier          |
| `pnpm format`      | Format code with Prettier        |
| `pnpm test`        | Run all tests                    |
| `pnpm db:studio`   | Open Drizzle Studio              |
| `pnpm db:generate` | Generate new migration           |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Acknowledgments

- IKEA naming conventions for Scandinavian places
- SvelteKit team for the framework
- Socket.IO for real-time multiplayer capabilities
