import { useState } from 'react';

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

export default ExampleComponent; 