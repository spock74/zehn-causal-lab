import { CausalGraph } from '../engine/Graph';

export const createSimpsonsParadox = (): CausalGraph => {
  const g = new CausalGraph();
  g.addNode('gender', 'Gender', ['Male', 'Female'], { x: 250, y: 50 });
  g.addNode('drug', 'Drug', ['Taken', 'Not Taken'], { x: 100, y: 200 });
  g.addNode('recovery', 'Recovery', ['Recovered', 'Not Recovered'], { x: 400, y: 200 });

  // Gender influences both Drug choice and Recovery rate (Confounder)
  g.addEdge('gender', 'drug');
  g.addEdge('gender', 'recovery');
  
  // Drug influences Recovery
  g.addEdge('drug', 'recovery');

  // Set realistic probabilities for Simpson's Paradox
  // P(Gender) - 50/50 split
  const genderNode = g.nodes.get('gender')!;
  genderNode.distribution.table['{}'] = { 'Male': 0.5, 'Female': 0.5 };

  // P(Drug|Gender) - Males more likely to take drug
  const drugNode = g.nodes.get('drug')!;
  drugNode.distribution.table[JSON.stringify({ gender: 'Male' })] = { 'Taken': 0.7, 'Not Taken': 0.3 };
  drugNode.distribution.table[JSON.stringify({ gender: 'Female' })] = { 'Taken': 0.3, 'Not Taken': 0.7 };

  // P(Recovery|Gender, Drug) - Complex interaction showing Simpson's Paradox
  // Males have better baseline recovery, drug helps both groups
  const recoveryNode = g.nodes.get('recovery')!;
  recoveryNode.distribution.table[JSON.stringify({ gender: 'Male', drug: 'Taken' })] = { 'Recovered': 0.93, 'Not Recovered': 0.07 };
  recoveryNode.distribution.table[JSON.stringify({ gender: 'Male', drug: 'Not Taken' })] = { 'Recovered': 0.87, 'Not Recovered': 0.13 };
  recoveryNode.distribution.table[JSON.stringify({ gender: 'Female', drug: 'Taken' })] = { 'Recovered': 0.73, 'Not Recovered': 0.27 };
  recoveryNode.distribution.table[JSON.stringify({ gender: 'Female', drug: 'Not Taken' })] = { 'Recovered': 0.69, 'Not Recovered': 0.31 };

  return g;
};

export const createColliderBias = (): CausalGraph => {
  const g = new CausalGraph();
  g.addNode('talent', 'Talent', ['High', 'Low'], { x: 100, y: 50 });
  g.addNode('hard_work', 'Hard Work', ['Yes', 'No'], { x: 400, y: 50 });
  g.addNode('success', 'Success', ['True', 'False'], { x: 250, y: 200 });

  // Both Talent and Hard Work cause Success
  g.addEdge('talent', 'success');
  g.addEdge('hard_work', 'success');

  // Set realistic probabilities for Collider Bias
  // P(Talent) - Talent is somewhat rare
  const talentNode = g.nodes.get('talent')!;
  talentNode.distribution.table['{}'] = { 'High': 0.3, 'Low': 0.7 };

  // P(Hard Work) - Hard work is common
  const hardWorkNode = g.nodes.get('hard_work')!;
  hardWorkNode.distribution.table['{}'] = { 'Yes': 0.6, 'No': 0.4 };

  // P(Success|Talent, Hard Work) - Both contribute to success
  const successNode = g.nodes.get('success')!;
  successNode.distribution.table[JSON.stringify({ talent: 'High', hard_work: 'Yes' })] = { 'True': 0.95, 'False': 0.05 };
  successNode.distribution.table[JSON.stringify({ talent: 'High', hard_work: 'No' })] = { 'True': 0.7, 'False': 0.3 };
  successNode.distribution.table[JSON.stringify({ talent: 'Low', hard_work: 'Yes' })] = { 'True': 0.6, 'False': 0.4 };
  successNode.distribution.table[JSON.stringify({ talent: 'Low', hard_work: 'No' })] = { 'True': 0.1, 'False': 0.9 };

  return g;
};

export const createChain = (): CausalGraph => {
  const g = new CausalGraph();
  g.addNode('fire', 'Fire', ['True', 'False'], { x: 100, y: 150 });
  g.addNode('smoke', 'Smoke', ['True', 'False'], { x: 250, y: 150 });
  g.addNode('alarm', 'Alarm', ['True', 'False'], { x: 400, y: 150 });

  g.addEdge('fire', 'smoke');
  g.addEdge('smoke', 'alarm');

  // Set realistic probabilities
  // P(Fire) - Fire is rare
  const fireNode = g.nodes.get('fire')!;
  fireNode.distribution.table['{}'] = { 'True': 0.1, 'False': 0.9 };

  // P(Smoke|Fire) - Smoke is very likely if there's fire
  const smokeNode = g.nodes.get('smoke')!;
  smokeNode.distribution.table[JSON.stringify({ fire: 'True' })] = { 'True': 0.95, 'False': 0.05 };
  smokeNode.distribution.table[JSON.stringify({ fire: 'False' })] = { 'True': 0.01, 'False': 0.99 };

  // P(Alarm|Smoke) - Alarm is very likely if there's smoke
  const alarmNode = g.nodes.get('alarm')!;
  alarmNode.distribution.table[JSON.stringify({ smoke: 'True' })] = { 'True': 0.9, 'False': 0.1 };
  alarmNode.distribution.table[JSON.stringify({ smoke: 'False' })] = { 'True': 0.05, 'False': 0.95 };

  return g;
};

export const createFork = (): CausalGraph => {
  const g = new CausalGraph();
  g.addNode('switch', 'Switch', ['On', 'Off'], { x: 250, y: 50 });
  g.addNode('light1', 'Light 1', ['On', 'Off'], { x: 150, y: 200 });
  g.addNode('light2', 'Light 2', ['On', 'Off'], { x: 350, y: 200 });

  g.addEdge('switch', 'light1');
  g.addEdge('switch', 'light2');

  // Set realistic probabilities
  // P(Switch) - Switch is equally likely to be on or off
  const switchNode = g.nodes.get('switch')!;
  switchNode.distribution.table['{}'] = { 'On': 0.5, 'Off': 0.5 };

  // P(Light1|Switch) - Light1 is almost always on when switch is on
  const light1Node = g.nodes.get('light1')!;
  light1Node.distribution.table[JSON.stringify({ switch: 'On' })] = { 'On': 0.98, 'Off': 0.02 };
  light1Node.distribution.table[JSON.stringify({ switch: 'Off' })] = { 'On': 0.01, 'Off': 0.99 };

  // P(Light2|Switch) - Light2 is almost always on when switch is on
  const light2Node = g.nodes.get('light2')!;
  light2Node.distribution.table[JSON.stringify({ switch: 'On' })] = { 'On': 0.98, 'Off': 0.02 };
  light2Node.distribution.table[JSON.stringify({ switch: 'Off' })] = { 'On': 0.01, 'Off': 0.99 };

  return g;
};
