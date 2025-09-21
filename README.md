# School 21 - 1st Anniversary Celebration

A beautiful celebration page for School 21's 1st anniversary with animated effects, music, and community congratulations.

## Features

- Typewriter effect for the main heading
- Particle background animations
- Interactive music control with animated line
- Form for submitting congratulations
- Fireworks effect when submitting congratulations
- Glass morphism design elements
- Responsive design

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add your music file:
   - Place your music file as `public/music.mp3`

3. Set up Supabase (if you want to persist congratulations):
   - Create a Supabase project at https://supabase.com
   - Create a table named `congratulations` with columns:
     - `id` (int, primary key, auto-increment)
     - `name` (text)
     - `message` (text)
     - `created_at` (timestamp, default: now())
   - Add your Supabase credentials to `.env.local`:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Dependencies

This project uses:
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS
- Framer Motion for animations
- react-spring for spring physics animations
- @tsparticles/react for particle effects
- typewriter-effect for typewriter animations
- Supabase for database (optional)

## Customization

- To change the music file, replace `public/music.mp3` with your own file
- To modify the particle effects, edit the options in `app/page.tsx`
- To change colors, modify the Tailwind classes in the components
- To adjust animations, modify the Framer Motion and react-spring configurations