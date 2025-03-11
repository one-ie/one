import React from 'react';
import { CodeHighlighter } from '../components/chat/syntax-highlighter';

const CodeExamplePage = () => {
  const exampleCode = `// src/Greeting.js
import React, { useState, useEffect } from 'react';

const Greeting = ({ name }) => {
  // State declaration using useState hook
  const [count, setCount] = useState(0);

  // Event handler
  const handleClick = () => {
    setCount(count + 1);
  };

  useEffect(() => {
    // Code to run on component mount
    console.log('Component mounted');
    
    // Cleanup function
    return () => {
      console.log('Component unmounted');
    };
  }, []);

  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>You clicked {count} times</p>
      <button onClick={handleClick}>
        Click me
      </button>
    </div>
  );
};

export default Greeting;`;

  const useEffectExample = `useEffect(() => {
  // This code runs after every render
  document.title = \`You clicked \${count} times\`;
  
  // Optional cleanup function
  return () => {
    // This code runs before the component unmounts
    // or before the effect runs again
    console.log('Cleaning up...');
  };
}, [count]); // Only re-run if count changes`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">React Hooks Examples</h1>
      <p className="mb-8">Below is an example of a React component using hooks:</p>
      
      <CodeHighlighter language="jsx">
        {exampleCode}
      </CodeHighlighter>
      
      <h2 className="text-2xl font-bold mt-12 mb-4">useEffect Hook</h2>
      <p className="mb-4">The useEffect Hook lets you perform side effects in function components:</p>
      
      <CodeHighlighter language="jsx">
        {useEffectExample}
      </CodeHighlighter>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Key Features</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>useState for local component state</li>
          <li>useEffect for side effects and lifecycle events</li>
          <li>Clean, functional component approach</li>
          <li>Dependency arrays for optimization</li>
        </ul>
      </div>
    </div>
  );
};

export default CodeExamplePage; 