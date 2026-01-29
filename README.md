# Football Intel

**Real-time football intelligence for the NBC Premier League**

Football Intel delivers instant, detailed match updates and comprehensive statistics for the Tanzania Premier League. While other platforms delay updates, we provide live scores, player-specific goal details, bookings, disallowed goals, and much more—all in real-time.

---

## Why Football Intel?

Existing platforms like Livescore, Sofascore, and Flashscore often lag behind live matches, leaving fans waiting for updates. Football Intel solves this by delivering:

- **Instant live updates** — Never miss a moment with real-time match events
- **Detailed player information** — See exactly who scored, when, and how
- **Complete match coverage** — Goals, bookings, substitutions, disallowed goals, and more
- **Comprehensive statistics** — Player performance, team analytics, and league standings
- **Reliable data** — Accurate, up-to-date information you can trust

---

## What We Offer

### Live Match Updates
Get real-time updates as matches unfold, including:
- Live scores and match status
- Goal scorers with exact timestamps
- Yellow and red cards with player names
- Substitutions and tactical changes
- Disallowed goals and VAR decisions
- Match statistics and possession data

### Player & Team Intelligence
- Complete player profiles with career statistics
- Team lineups and squad information
- Performance analytics and form tracking
- Head-to-head records between teams

### League Standings & Statistics
- Real-time league table updates
- Match-by-match statistics
- Team and player performance metrics
- Historical data and trends

### Search & Discovery
Quickly find players, teams, and matches with our fast, intuitive search.

---

## Who It's For

Football Intel serves:
- **Football fans** who want instant, detailed match updates
- **Sports media** platforms needing reliable data feeds
- **Mobile and web applications** requiring real-time football data
- **Analysts and researchers** looking for comprehensive statistics

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) installed on your system
- Docker and Docker Compose (for running services)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/meshackkazimoto/football-intel.git
   cd football-intel
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start services** (PostgreSQL, Redis, Typesense)
   ```bash
   docker compose -f docker/docker-compose.yml up -d
   ```

4. **Run development server**
   ```bash
   bun dev
   ```

That's it! The platform will start running in development mode with hot-reload enabled.

---

## For Developers

Football Intel provides APIs and data feeds for developers and platforms. Contact us to learn more about integrating our services into your application.

---

*Delivering the fastest, most detailed football intelligence for the NBC Premier League.*
