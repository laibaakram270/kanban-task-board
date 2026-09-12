# Interactive Kanban Task Board

An interactive and responsive Kanban Task Board built with React and Vite. The application allows users to create, edit, delete, move, and reorder tasks across different workflow columns.

The application also supports undo/redo functionality using the Command Pattern and automatically saves board data locally using IndexedDB, allowing tasks to persist after refreshing the page.

## Features

### 1. Kanban Board

- Three workflow columns:
  - To Do
  - In Progress
  - Done
- Responsive layout for different screen sizes.
- Clean and modern user interface using Tailwind CSS.

### 2. Task Management

Users can:

- Create new tasks.
- Edit existing task titles.
- Delete tasks.
- Move tasks between columns.
- Reorder tasks within the same column.

### 3. Native Drag and Drop

The application uses the native HTML5 Drag and Drop API.

Users can:

- Drag tasks between columns.
- Reorder tasks within a column.
- See a visual drop indicator when moving a task.

### 4. Undo and Redo

The application implements the Command Pattern to provide state history.

Supported commands include:

- CreateTaskCommand
- EditTaskCommand
- MoveTaskCommand
- ReorderTaskCommand

Users can:

- Undo previous actions.
- Redo undone actions.
- Maintain separate undo and redo histories.

### 5. Offline Local Persistence

Board data is stored locally using IndexedDB.

This allows:

- Tasks to remain after refreshing the browser.
- Task edits to persist.
- Task movements to persist.
- Task ordering to persist.
- The application to work without relying on a backend database.

### 6. Accessibility

The application includes accessibility features such as:

- ARIA labels.
- Accessible task and column descriptions.
- Labels for form inputs.
- Keyboard-focusable task cards.
- Accessible buttons and controls.

### 7. Responsive Design

The interface is designed to work across:

- Desktop
- Laptop
- Tablet
- Mobile-sized screens

## Technology Stack

- React
- Vite
- JavaScript
- Tailwind CSS
- HTML5 Drag and Drop API
- IndexedDB
- CSS
- Git
- GitHub

## Dependencies

### Main Dependencies

- `react`
- `react-dom`

### Development Dependencies

- `vite`
- `tailwindcss`
- `@tailwindcss/vite`
- `@vitejs/plugin-react`
- `eslint`

The project uses browser-native IndexedDB, so no separate database server is required.

## Installation

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/laibaakram270/kanban-task-board
```
## Step 2: Open the Project
```bash
cd kanban-task-board
```
## Step 3: Install Dependencies
```bash
npm install
```
## Step 4: Start the Development Server
```bash
npm run dev
```
## DEMO VIDEO
https://drive.google.com/file/d/1K6EJJnxsmy5iYPgfDwWgt-KL4HNOTiAJ/view?usp=sharing
## Vite will provide a local development URL
```bash
https://localhost:5173/
```
## Step 5:
Open the URL in the web browser.
