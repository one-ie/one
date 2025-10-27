import { useState } from 'react';
import { ChevronDown, Copy, Check } from 'lucide-react';

interface Param {
  name: string;
  type: string;
  description: string;
  required?: boolean;
}

interface Endpoint {
  method: string;
  path: string;
  title: string;
  description: string;
  pathParams?: Param[];
  queryParams?: Param[];
  bodyParams?: Param[];
  requiresAuth?: boolean;
  curl: string;
  example: any;
}

interface EndpointCardProps {
  endpoint: Endpoint;
}

export default function EndpointCard({ endpoint }: EndpointCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-700';
      case 'POST':
        return 'bg-green-100 text-green-700';
      case 'PUT':
        return 'bg-orange-100 text-orange-700';
      case 'DELETE':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const handleCopyCurl = async () => {
    try {
      await navigator.clipboard.writeText(endpoint.curl);
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow hover:shadow-lg transition">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-slate-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded font-semibold text-sm ${getMethodColor(endpoint.method)}`}>
                {endpoint.method}
              </span>
              <code className="text-sm font-mono text-slate-700">{endpoint.path}</code>
              {endpoint.requiresAuth && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
                  Requires Auth
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{endpoint.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{endpoint.description}</p>
          </div>
          <ChevronDown
            size={20}
            className={`text-slate-500 transition ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="border-t border-slate-200 divide-y divide-slate-200">
          {/* Parameters */}
          {(endpoint.pathParams?.length || endpoint.queryParams?.length || endpoint.bodyParams?.length) && (
            <div className="p-4">
              <h4 className="font-semibold text-slate-900 mb-4">Parameters</h4>

              {endpoint.pathParams && endpoint.pathParams.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Path Parameters</p>
                  <div className="space-y-2">
                    {endpoint.pathParams.map((param) => (
                      <div key={param.name} className="text-sm p-2 bg-slate-50 rounded">
                        <span className="font-mono text-blue-600">{param.name}</span>
                        <span className="text-slate-600 ml-2">({param.type})</span>
                        {param.required && <span className="text-red-600 ml-2">*</span>}
                        <p className="text-slate-600 text-xs mt-1">{param.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {endpoint.queryParams && endpoint.queryParams.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Query Parameters</p>
                  <div className="space-y-2">
                    {endpoint.queryParams.map((param) => (
                      <div key={param.name} className="text-sm p-2 bg-slate-50 rounded">
                        <span className="font-mono text-blue-600">{param.name}</span>
                        <span className="text-slate-600 ml-2">({param.type})</span>
                        {param.required && <span className="text-red-600 ml-2">*</span>}
                        <p className="text-slate-600 text-xs mt-1">{param.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {endpoint.bodyParams && endpoint.bodyParams.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">Request Body</p>
                  <div className="space-y-2">
                    {endpoint.bodyParams.map((param) => (
                      <div key={param.name} className="text-sm p-2 bg-slate-50 rounded">
                        <span className="font-mono text-blue-600">{param.name}</span>
                        <span className="text-slate-600 ml-2">({param.type})</span>
                        {param.required && <span className="text-red-600 ml-2">*</span>}
                        <p className="text-slate-600 text-xs mt-1">{param.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Curl Example */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-slate-900">Curl Example</h4>
              <button
                onClick={handleCopyCurl}
                className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-sm font-medium text-slate-700 transition"
              >
                {copiedCurl ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-slate-900 rounded text-slate-100 text-sm font-mono overflow-x-auto">
              <code>{endpoint.curl}</code>
            </pre>
          </div>

          {/* Response Example */}
          <div className="p-4">
            <h4 className="font-semibold text-slate-900 mb-2">Response Example</h4>
            <pre className="p-3 bg-slate-50 rounded text-slate-700 text-sm font-mono overflow-x-auto border border-slate-200">
              <code>{JSON.stringify(endpoint.example, null, 2)}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
