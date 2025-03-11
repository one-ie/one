import React from 'react';
import { CodeHighlighter } from '../components/chat/syntax-highlighter';

const ExampleComponentPage = () => {
  return (
    <div className="bg-zinc-950 p-0">
      <div>
        <CodeHighlighter language="bash">
          {"npm start"}
        </CodeHighlighter>
      </div>
      
      <p className="text-white my-8 px-4">Your browser should open and display the list of items.</p>
      
      <p className="text-white mb-4 px-4">Here's a brief overview of what we did:</p>
      
      <ul className="text-white mb-8 list-disc pl-10 pr-4">
        <li className="mb-4">Created a new component</li>
      </ul>
      
      <div>
        <CodeHighlighter language="jsx">
          {"ItemList"}
        </CodeHighlighter>
      </div>
    </div>
  );
};

export default ExampleComponentPage; 