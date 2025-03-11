import React from 'react';
import { CodeHighlighter } from '../components/chat/syntax-highlighter';

const CodeExamplePage = () => {
  const exampleCode = `import React, { useState } from 'react';

const ExampleComponent = () => {
  // State declaration using useState hook
  const [count, setCount] = useState(0);

  // Event handler
  const handleClick = () => {
    setCount(count + 1);
  };

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-2">Example Component</h2>
      <p className="mb-4">You clicked {count} times</p>
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Click me
      </button>
    </div>
  );
};

export default ExampleComponent;`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Code Example</h1>
      <p className="mb-8">Below is an example of a React component with the new code styling:</p>
      
      <CodeHighlighter language="jsx">
        {exampleCode}
      </CodeHighlighter>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Features</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Syntax highlighting with VS Code-like colors</li>
          <li>Header with language indicator</li>
          <li>Copy button that appears on hover</li>
          <li>Dark theme with proper contrast</li>
          <li>Monospace font for better code readability</li>
        </ul>
      </div>
    </div>
  );
};

export default CodeExamplePage; 