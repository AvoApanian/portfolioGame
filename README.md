# Cosmo Portfolio

A straight-line 3D flythrough portfolio built with React + @react-three/fiber.
The ship always flies forward on its own; you only control boost and brake.
Along the way it passes 4 planets pulled from Avo Apanian's CV, each one
triggering an autopilot orbit and a sliding info panel.

## Getting started

```bash
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173).

For a production build: `npm run build` (output in `dist/`).

## Your 3D model

`Rocket.jsx` loads `../../assets/mesh3D/fusee.glb` with `useGLTF`. Drop your
file at:

```
src/assets/mesh3D/fusee.glb
```

(the folder already exists, with a `README.txt` reminder inside it).

## Project structure

```
src/
  App.jsx
  main.jsx
  index.css
  assets/
    mesh3D/            your .glb goes here
  audio/
    soundManager.js     Web Audio engine: engine hum, boost, chimes, music
  constants/
    gameConfig.js        every tunable number lives here
  features/
    game/
      GameScene.jsx      flight loop, orbit autopilot, planet triggers
      Rocket.jsx
      Space.jsx          starfield, nebulae, asteroids, black hole, galaxies
      Asteroids.jsx
      BlackHole.jsx
      Galaxies.jsx
      ShootingStars.jsx
      PlasmaTrail.jsx
      planets.js         planet positions / sizes / colors / tags
      controls/
        KeyboardControls.jsx
        MobileControls.jsx
    hud/
      HUD.jsx            speed, nitro, language switch, sound/music toggles
      InfoPanel.jsx       sliding CV panel
    portfolio/
      Portfolio.jsx       classic, non-game portfolio page
  i18n/
    index.jsx             I18nProvider + useI18n hook
    en.js / fr.js / hy.js  English, French, Armenian dictionaries
  utils/
    logger.js             tagged, timestamped console logging
```

All CV text (titles, subtitles, paragraphs) lives in `src/i18n/en.js`,
`fr.js` and `hy.js`. Structural planet data (position, size, color, ring,
moon, orbit radius, tags) lives in `src/features/game/planets.js`.

## Controls

Only two actions exist — there is no steering, the ship always flies
straight ahead on its own.

- **Keyboard:** hold `Shift` to boost, hold `Space` (or `S`) to brake.
- **Mobile:** two on-screen buttons, BOOST and BRAKE.

## Planets

The ship auto-pilots into a temporary orbit around each planet when it
gets close, opening a sliding panel with that section of the CV. Closing
the panel (✕) ends the orbit immediately and resumes the straight flight;
otherwise it ends on its own after a few seconds. Flying away and back
lets a planet retrigger.

1. Home & Profile
2. Projects & Megastructures — nucleoOS, the Stellar Migration & Solar
   System Relocation Simulation, NeuroX, the personal search engine, and
   the Python/Pygame games
3. Experience & Startup — TNTGO (Armenia) and startups in France
4. Contact

## Languages

English is the default. A language switch (EN / FR / HY) sits in the top
right of the HUD and on the classic portfolio page; the choice is
remembered between visits (`localStorage`).

## Sound

Everything is synthesised live with the Web Audio API
(`src/audio/soundManager.js`) — no audio files to provide:

- a continuous engine hum that follows speed and boost
- a boost "whoosh"
- a two-tone chime when entering orbit around a planet
- small UI blips
- a slow, looping ambient background pad

Sound effects and music have separate toggle buttons (🔊/🔇 and 🎶/🎵) in
the HUD. Browsers block audio before any interaction, so the engine starts
on the first key press or tap.

## Classic portfolio (no game)

"Classic Portfolio →" in the HUD switches to a plain scrollable page with
the same content, addressed at `#/portfolio` (shareable as
`your-site.com/#/portfolio`). "← 3D game mode" switches back.

## Logging

`src/utils/logger.js` gives tagged, timestamped console output. The game
loop, controls, audio engine, i18n provider and app shell all log their
key events (boost engaged/released, orbit started/ended, language
changed, view changed, sound/music toggled) — open the browser console to
follow along.

## Not implemented (further ideas)

Space portals, eclipses, fully procedural solar systems, and a sky that
changes by region are the heavier items from the original wish list that
didn't make it in. Let me know if you'd like one of them pushed further.
