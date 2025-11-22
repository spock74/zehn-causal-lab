export type DifficultyLevel = 'intuitive' | 'phd';

export interface Concept {
  id: string;
  title: string;
  intuitive: string;
  phd: string;
}

export const concepts: Concept[] = [
  {
    id: 'dag',
    title: 'Directed Acyclic Graph (DAG)',
    intuitive: `A map of cause and effect. 
    - **Nodes** (circles) represent variables (like "Rain" or "Wet Grass").
    - **Arrows** show the direction of influence. "Rain -> Wet Grass" means rain causes the grass to get wet.
    - **Acyclic** means there are no loops; you can't be your own grandfather!`,
    phd: `A **Directed Acyclic Graph $G = (V, E)$** consists of a set of vertices $V$ and directed edges $E$, with no directed cycles. 
    In Causal Inference, we assume the **Causal Markov Condition**: a variable $X_i$ is independent of its non-descendants given its parents $PA_i$.
    The joint probability distribution factorizes as:
    $$P(x_1, ..., x_n) = \\prod_i P(x_i | pa_i)$$`
  },
  {
    id: 'confounder',
    title: 'Confounder',
    intuitive: `A common cause of two other variables. 
    For example, "Summer Heat" causes both "Ice Cream Sales" and "Shark Attacks". 
    If you ignore the heat, it looks like ice cream causes shark attacks! This is a false correlation.`,
    phd: `A variable $Z$ is a **confounder** of the relationship between $X$ and $Y$ if $Z$ causally influences both $X$ and $Y$.
    Graphically, $X \\leftarrow Z \\to Y$.
    Failure to condition on $Z$ opens a **backdoor path** between $X$ and $Y$, introducing spurious correlation (bias).`
  },
  {
    id: 'collider',
    title: 'Collider',
    intuitive: `A variable that is caused by two others.
    Example: "Talent" and "Hard Work" both cause "Success".
    If you only look at Successful people (conditioning on the collider), you might see a weird negative link between Talent and Hard Work (if they are successful but lazy, they MUST be talented). This is called **Selection Bias**.`,
    phd: `A node $Z$ is a **collider** on a path if arrows meet at $Z$: $X \\to Z \\leftarrow Y$.
    Unlike chains or forks, a collider **blocks** the flow of association.
    However, **conditioning** on a collider (or its descendants) **opens** the path, inducing a dependency between $X$ and $Y$ (Berkson's Paradox).`
  },
  {
    id: 'do-calculus',
    title: 'The Do-Operator',
    intuitive: `The difference between **seeing** and **doing**.
    - **Seeing (Observation):** "I see the grass is wet. It probably rained." (Inference)
    - **Doing (Intervention):** "I turn on the sprinkler." (Action)
    When you *do* something, you change the world. You break the link from the past (clouds didn't cause you to turn the sprinkler, YOU did).`,
    phd: `The **Do-Operator**, denoted $P(Y | do(X=x))$, represents the interventional distribution.
    It is defined by **mutilating** the graph $G$: removing all incoming edges to $X$ ($PA_X = \\emptyset$) and setting $X=x$ deterministically.
    $$P(v | do(x)) = \\prod_{i, X_i \\neq X} P(x_i | pa_i) \\quad \\text{(Truncated Factorization)}$$`
  }
];
