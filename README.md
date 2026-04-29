# Student Dashboard

A redesign of Notion focused on being more usable for students. Built as a single-page React app with resizable panels, class-specific views, and productivity tools.

## Overview

This project provides a unified workspace for common student workflows:

- Tracking tasks and deadlines
- Viewing events in a class-aware calendar
- Managing notes
- Reading inbox-style course updates
- Running a Pomodoro timer
- Exploring ideas in a visual mind map
- Simulating syllabus parsing into actionable items

The current app uses in-memory mock data (no backend yet), making it ideal for UI prototyping and interaction design.

## Tech Stack

- React 18 + TypeScript
- Vite
- React Router
- Tailwind CSS
- react-resizable-panels
- date-fns
- lucide-react
- @xyflow/react (React Flow)

## App Routes

- `/` - Main dashboard
- `/class/:classId` - Class dashboard (assignments, notes, filtered calendar/tasks)
- `/notes` - Notes workspace
- `/mindmap` - Mind map editor
- `/syllabus` - Syllabus parser demo

## Feature Breakdown

### Main Dashboard

- Resizable 3-column layout
- Calendar panel with day-level event details
- To-do list with create/toggle/delete + active/completed filtering
- Inbox panel with read-state handling and detail view
- Pomodoro timer with focus/break modes and session counter

### Class Dashboard

- Class-specific header (professor, credits, schedule, room)
- Assignment list with status badges and optional grade display
- Notes list filtered by class
- Calendar and to-do panels filtered by selected class

### Notes Workspace

- Search notes by title/content
- Create and delete notes
- Edit note content in markdown-like plain text
- Inline markdown rendering preview (headings, lists, paragraphs)
- Class tag and note tags display

### Mind Map

- Interactive graph canvas via React Flow
- Add custom nodes
- Connect nodes visually
- Delete selected nodes/edges
- Includes controls, minimap, and dotted background

### Syllabus Parser (Demo)

- Drag-and-drop or file-picker upload UI
- Simulated parse states: upload -> parsing -> results
- Displays extracted dates and policy summaries from mock output
- Per-item actions to mark as added to calendar/task (UI state only)
- "Add All" shortcut for all extracted dates

## Data Model

Mock data currently lives in `src/data/mockData.ts` and covers:

- Classes
- Tasks
- Calendar events
- Emails
- Notes
- Assignments

Core TypeScript interfaces are defined in `src/types/index.ts`.

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm

### Install

```bash
npm install
```

### Run Dev Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Scripts

- `npm run dev` - Start local dev server
- `npm run build` - Type-check and build
- `npm run preview` - Preview production bundle
- `npm run lint` - Run ESLint

## Current Limitations

- No backend or persistent storage
- No authentication/authorization
- Syllabus parser and inbox-to-task conversion are mock/demo behavior
- Notes markdown support is a lightweight custom renderer (not full markdown spec)

## Suggested Next Steps

- Persist data (local storage, then API/database)
- Add real auth and per-user workspaces
- Replace syllabus mock pipeline with actual file parsing + extraction
- Connect inbox actions to real task creation
- Add automated tests for critical UI flows
