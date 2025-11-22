# Zehn Causal Lab - An Interactive Causal Inference Tool

Zehn Causal Lab is a web-based application designed to help users explore and learn about causal inference through interactive Directed Acyclic Graphs (DAGs). It provides a hands-on experience with concepts like causal graphs, probability distributions, and the effects of interventions.

## Key Features

- **Interactive Graph Editor**: Easily create, modify, and arrange causal graphs using a drag-and-drop interface, powered by ReactFlow.
- **Probability Visualization**: View and understand the conditional probability distributions for each node in the graph, visualized with Recharts.
- **Causal Interventions**: Simulate interventions on nodes (using the do-operator) to see how they impact the probabilities throughout the graph.
- **Built-in Examples**: Get started quickly with a selection of classic causal models (e.g., chains, forks, colliders, and more complex examples).
- **Interactive Tutorial**: A step-by-step tutorial guides new users through the core concepts and functionalities of the application.
- **LaTeX Support**: Display mathematical formulas for probabilities and causal concepts clearly using KaTeX.

## Tech Stack

- **Frontend**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
- **Graph Visualization**: [ReactFlow](https://reactflow.dev/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Linting**: [ESLint](https://eslint.org/)

## Getting Started

Follow these steps to set up and run the project locally. This project uses [pnpm](https://pnpm.io/) as the package manager.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/spock74/zehn-causal-lab.git    
    cd zehn-causal-lab
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Run the development server:**

    ```bash
    pnpm dev
    ```

    The application will be available at `http://localhost:5173` (or the next available port).

## Usage

- **Create Nodes**: Double-click on the canvas to create a new causal variable.
- **Create Edges**: Click and drag from one node's handle to another to create a causal relationship.
- **Select a Node**: Click on a node to view its associated conditional probability table in the side panel.
- **Perform Interventions**: Use the "Intervention" controls in the side panel to set a variable to a specific value and observe its downstream effects.
- **Explore Examples**: Use the "Examples" menu to load pre-built graphs that demonstrate different causal structures.

## Screenshots

YTBD

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
