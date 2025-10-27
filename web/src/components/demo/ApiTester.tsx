import { useState } from 'react';
import { Send, Copy, Check, AlertCircle } from 'lucide-react';

interface ApiTesterProps {
  endpoints: {
    [key: string]: any[];
  };
}

export default function ApiTester({ endpoints }: ApiTesterProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('http://localhost:4321/api/groups');
  const [headers, setHeaders] = useState('Content-Type: application/json');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  // Get all endpoints flat
  const allEndpoints = Object.values(endpoints).flat();

  const handleEndpointSelect = (endpoint: any) => {
    setSelectedEndpoint(endpoint);
    setMethod(endpoint.method);
    setUrl(endpoint.path.includes('[')
      ? `http://localhost:4321/api${endpoint.path.replace('[id]', '123')}`
      : `http://localhost:4321/api${endpoint.path}`
    );
    setBody(endpoint.bodyParams ? JSON.stringify({
      [endpoint.bodyParams[0].name]: 'example_value'
    }, null, 2) : '');
    setResponse(null);
    setError(null);
  };

  const handleSendRequest = async () => {
    try {
      setLoading(true);
      setError(null);

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method !== 'GET' && body) {
        options.body = body;
      }

      const fullUrl = new URL(url);
      if (method === 'GET' && body) {
        try {
          const params = JSON.parse(body);
          Object.entries(params).forEach(([key, value]) => {
            fullUrl.searchParams.append(key, String(value));
          });
        } catch (e) {
          // Ignore if body is not JSON for GET
        }
      }

      const res = await fetch(fullUrl.toString(), options);
      const data = await res.json();

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: {
          'content-type': res.headers.get('content-type') || 'application/json',
          'cache-control': res.headers.get('cache-control') || 'no-cache',
        },
        body: data,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to send request'
      );
    } finally {
      setLoading(false);
    }
  };

  const generateCurl = () => {
    let curl = `curl -X ${method} "${url}"`;

    if (method !== 'GET' && body) {
      curl += ` \\
  -H 'Content-Type: application/json' \\
  -d '${body.replace(/'/g, "'\\''")}'`;
    }

    return curl;
  };

  const handleCopyCurl = async () => {
    try {
      await navigator.clipboard.writeText(generateCurl());
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyResponse = async () => {
    if (!response) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(response.body, null, 2));
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Request Panel */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Request</h3>

        {/* Endpoint Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Select Endpoint
          </label>
          <select
            value={selectedEndpoint?.path || ''}
            onChange={(e) => {
              const endpoint = allEndpoints.find((ep) => ep.path === e.target.value);
              if (endpoint) handleEndpointSelect(endpoint);
            }}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose an endpoint...</option>
            {allEndpoints.map((endpoint) => (
              <option key={endpoint.path} value={endpoint.path}>
                {endpoint.method} {endpoint.path} - {endpoint.title}
              </option>
            ))}
          </select>
        </div>

        {selectedEndpoint && (
          <>
            {/* Method */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            {/* Headers */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Headers
              </label>
              <textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            {/* Body */}
            {method !== 'GET' && (
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Request Body (JSON)
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            )}

            {/* Curl Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Curl Command
                </label>
                <button
                  onClick={handleCopyCurl}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition"
                >
                  {copiedCurl ? (
                    <>
                      <Check size={14} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded text-xs font-mono overflow-x-auto">
                <code>{generateCurl()}</code>
              </pre>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handleSendRequest}
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <Send size={18} />
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </>
        )}
      </div>

      {/* Response Panel */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Response</h3>

        {!response && !error && !selectedEndpoint && (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center text-slate-600">
            <p>Select an endpoint and send a request to see the response</p>
          </div>
        )}

        {response && (
          <>
            {/* Status */}
            <div className={`p-3 rounded-lg ${
              response.status >= 200 && response.status < 300
                ? 'bg-green-50 border border-green-200'
                : response.status >= 400
                ? 'bg-red-50 border border-red-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <p className={`text-sm font-semibold ${
                response.status >= 200 && response.status < 300
                  ? 'text-green-900'
                  : response.status >= 400
                  ? 'text-red-900'
                  : 'text-yellow-900'
              }`}>
                Status: {response.status} {response.statusText}
              </p>
            </div>

            {/* Headers */}
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2">Response Headers</p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-700">
                {Object.entries(response.headers).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-blue-600">{key}:</span> {String(value)}
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-900">Response Body</p>
                <button
                  onClick={handleCopyResponse}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition"
                >
                  {copiedResponse ? (
                    <>
                      <Check size={14} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 overflow-x-auto max-h-96">
                <code>{JSON.stringify(response.body, null, 2)}</code>
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
