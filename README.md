# Dunbar Hierarchy App

_Automatically synced with your [v0.dev](https://v0.dev) deployments_

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/lesoto-com/v0-visualize-your-world)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/tVWj8kP5G9c)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/lesoto-com/v0-visualize-your-world](https://vercel.com/lesoto-com/v0-visualize-your-world)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/tVWj8kP5G9c](https://v0.dev/chat/projects/tVWj8kP5G9c)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repositor

Dunbar Hierarchy App - Codebase Explanation
This is a Next.js 15 TypeScript application that visualizes Dunbar's Number theory - the cognitive limits of human social relationships. The app was built using v0.dev and is automatically synced with deployments on Vercel.

🎯 Core Concept
The app explores Dunbar's hierarchy of social relationships, which suggests humans can maintain different levels of social connections:

Inner Circle (5 people) - Daily contact, high emotional investment
Sympathy Group (15 people) - Weekly contact, close friends
Affinity Group (50 people) - Monthly contact, party invitees
Active Network (150 people) - Quarterly contact, meaningful conversations
Recognition Group (500 people) - Yearly contact, faces and names
🛠 Technology Stack
Frontend Framework:

Next.js 15.2.4 with App Router
React 19 with TypeScript
Modern ES6+ features
Styling & UI:

Tailwind CSS for utility-first styling
Extensive Radix UI component library (@radix-ui/react-\*)
Lucide React icons
Custom CSS animations and gradients
Key Libraries:

react-hook-form + zod for form validation
recharts for data visualization
next-themes for theme switching
date-fns for date manipulation
embla-carousel-react for carousels
📁 Project Structure
/app/
├── layout.tsx # Root layout with fonts and metadata
├── page.tsx # Main application component
└── globals.css # Global styles

/components/
├── ui/ # 50+ Radix UI-based design system components
├── network-diagram.tsx # Interactive network visualization
├── radial-diagram.tsx # Concentric circles view
├── level-details.tsx # Detailed level information
├── relationship-inventory.tsx # Personal relationship tracker
├── digital-parallels-explorer.tsx # Digital age comparisons
└── life-stage-comparison.tsx # Lifecycle relationship changes
