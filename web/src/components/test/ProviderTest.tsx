/**
 * Simple test component to verify AppProviders works
 */

export function ProviderTest() {
  console.log('[ProviderTest] Component rendering!');

  return (
    <div style={{ padding: '20px', border: '2px solid green', margin: '20px' }}>
      <h2>Provider Test</h2>
      <p>If you see this, React is working!</p>
    </div>
  );
}
