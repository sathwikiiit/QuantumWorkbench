# **App Name**: Quantum Workbench

## Core Features:

- Connection & Profile Manager: Configure and test SQL database connections, introspect schemas, and manage distinct workbench profiles associated with each connection.
- Visual Schema Workbench: Drag and drop database tables onto a canvas, visually inspect their columns, alias tables, and pin important columns for quick access.
- Dynamic Join Builder: Graphically define and manage joins between tables on the canvas, selecting join types (INNER/LEFT), and toggle their active state for query generation.
- Query Generation: Generate parameterized SQL queries from the visual workbench setup, incorporating selected columns, a visual filter builder, sorting, and limits.
- SQL Preview & Execution: View generated SQL with syntax highlighting, copy it, execute queries (via a mock API), and define parameter presets for dynamic query values.
- Query Results & History: Display query results in a tabular grid, view execution metrics (time, row count), and browse a detailed history of all past query executions.
- Template & Saved Query Manager: Save current workbench layouts as reusable join templates and store complete query definitions for easy recall and collaboration.

## Style Guidelines:

- Default Theme: Dark theme for a professional developer experience. It emphasizes focus and reduces eye strain.
- Primary interactive elements: A rich, technical blue (#2662D9) is used for active states, primary buttons, and selected items, reflecting clarity and precision.
- Background color: A deep charcoal blue (#21242C) provides a subdued backdrop, ensuring content remains prominent without harsh contrast.
- Accent color: A vibrant cyan (#47CFEB) is utilized for alerts, specific highlights, and visual cues where high visibility is crucial, such as active joins or success states.
- Headline font: 'Space Grotesk' (sans-serif) for titles and primary headers, imparting a modern, sharp, and slightly futuristic technological feel.
- Body font: 'Inter' (sans-serif) for all body text, ensuring legibility and a neutral, professional appearance across varied content densities.
- Code font: 'Source Code Pro' (monospace sans-serif) for displaying SQL queries and code snippets, providing a clear and readable programming typeface.
- Icons: Use a consistent set of professional, monochromatic icons with sharp lines and clear meanings, adhering to a common design language like Lucide or Material Symbols for an integrated developer tool feel.
- Layout Structure: Multi-panel design (left sidebar, top bar, center workspace, right panel, bottom panel) resembling a traditional IDE, with distinct, organized content areas and subtle dividers.
- Animations: Limit animations to subtle transitions for state changes and user interactions (e.g., panel expansion, item selection) to maintain a practical, performant, and gimmick-free experience.