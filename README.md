# Blue Sky Bot — All-in-One Discord Bot

## Setup

1. Install dependencies
```
npm install
```

2. Create `.env` from the example
```
cp .env.example .env
```

3. Fill in your `.env`
```
TOKEN=your_discord_bot_token
PREFIX=!
PORT=3000
```

4. Start the bot
```
npm start
```

5. Open dashboard at `http://localhost:3000`

---

## Features

### Moderation
- `!ban @user [reason]` — Ban a member
- `!kick @user [reason]` — Kick a member
- `!mute @user [minutes]` — Timeout a member
- `!warn @user [reason]` — Warn a member
- `!warnings [@user]` — View warnings
- `!purge [1-100]` — Bulk delete messages
- `!lock` — Lock current channel
- `!unlock` — Unlock current channel

### Utility
- `!help` — Show all commands
- `!ping` — Check bot latency
- `!userinfo [@user]` — User information
- `!serverinfo` — Server information
- `!avatar [@user]` — Show avatar
- `!afk [reason]` — Set AFK status
- `!poll [question]` — Create a poll
- `!announce [text]` — Make announcement
- `!ticket` — Open support ticket panel

### Fun
- `!8ball [question]` — Magic 8-ball
- `!flip` — Flip a coin
- `!roll [sides]` — Roll dice
- `!rps [rock/paper/scissors]` — Rock Paper Scissors

### Economy
- `!balance [@user]` — Check coin balance
- `!daily` — Claim daily coins (24h cooldown)
- `!work` — Work for coins (1h cooldown)
- `!transfer @user [amount]` — Transfer coins

### Leveling
- `!rank [@user]` — Check rank and XP

### Auto Systems
- Welcome / Leave messages
- XP and leveling on message
- AFK detection on mention
- Support ticket system with buttons
- Cooldown system per command
