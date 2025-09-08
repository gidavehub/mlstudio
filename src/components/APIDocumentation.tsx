import React, { useState } from 'react';
import { Copy, CheckCircle, XCircle } from 'lucide-react';

interface APIDocumentationProps {
  apiKey: string;
  modelName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const APIDocumentation: React.FC<APIDocumentationProps> = ({ 
  apiKey, 
  modelName, 
  isOpen, 
  onClose 
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const endpoint = `${window.location.origin}/api/predict/${apiKey}`;
  const exampleCode = `// JavaScript/Node.js Example
const response = await fetch('${endpoint}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    inputs: [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0]
  })
});

const result = await response.json();
console.log('Prediction:', result.prediction);`;

  const pythonExample = `# Python Example
import requests
import json

url = '${endpoint}'
data = {
    'inputs': [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0]
}

response = requests.post(url, json=data)
result = response.json()
print(f'Prediction: {result["prediction"]}')`;

  const curlExample = `curl -X POST '${endpoint}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "inputs": [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0]
  }'`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">API Documentation</h2>
            <p className="text-slate-400 mt-1">How to use your {modelName} API</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* API Endpoint */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">API Endpoint</h3>
            <div className="flex items-center justify-between bg-slate-600 rounded-lg p-3">
              <code className="text-slate-200 text-sm font-mono flex-1">
                {endpoint}
              </code>
              <button
                onClick={() => copyToClipboard(endpoint)}
                className="ml-3 text-blue-400 hover:text-blue-300 transition-colors"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Request Format */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Request Format</h3>
            <div className="space-y-3">
              <div>
                <p className="text-slate-300 text-sm mb-2">Method: <span className="text-green-400 font-mono">POST</span></p>
                <p className="text-slate-300 text-sm mb-2">Content-Type: <span className="text-blue-400 font-mono">application/json</span></p>
              </div>
              <div>
                <p className="text-slate-300 text-sm mb-2">Request Body:</p>
                <pre className="bg-slate-600 rounded-lg p-3 text-slate-200 text-sm overflow-x-auto">
{`{
  "inputs": [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0]
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Response Format */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Response Format</h3>
            <pre className="bg-slate-600 rounded-lg p-3 text-slate-200 text-sm overflow-x-auto">
{`{
  "success": true,
  "prediction": 123.45,
  "modelName": "${modelName}",
  "timestamp": 1640995200000,
  "targetRange": {
    "min": 100.0,
    "max": 200.0
  }
}`}
            </pre>
          </div>

          {/* Code Examples */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Code Examples</h3>
            
            {/* JavaScript */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-slate-300 font-medium">JavaScript/Node.js</h4>
                <button
                  onClick={() => copyToClipboard(exampleCode)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="bg-slate-600 rounded-lg p-3 text-slate-200 text-sm overflow-x-auto">
                {exampleCode}
              </pre>
            </div>

            {/* Python */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-slate-300 font-medium">Python</h4>
                <button
                  onClick={() => copyToClipboard(pythonExample)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="bg-slate-600 rounded-lg p-3 text-slate-200 text-sm overflow-x-auto">
                {pythonExample}
              </pre>
            </div>

            {/* cURL */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-slate-300 font-medium">cURL</h4>
                <button
                  onClick={() => copyToClipboard(curlExample)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="bg-slate-600 rounded-lg p-3 text-slate-200 text-sm overflow-x-auto">
                {curlExample}
              </pre>
            </div>
          </div>

          {/* Error Handling */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Error Handling</h3>
            <div className="space-y-3">
              <div>
                <p className="text-red-400 font-mono text-sm">400 Bad Request</p>
                <p className="text-slate-300 text-sm">Invalid input format or missing required fields</p>
              </div>
              <div>
                <p className="text-red-400 font-mono text-sm">401 Unauthorized</p>
                <p className="text-slate-300 text-sm">Invalid API key</p>
              </div>
              <div>
                <p className="text-red-400 font-mono text-sm">403 Forbidden</p>
                <p className="text-slate-300 text-sm">API is not active</p>
              </div>
              <div>
                <p className="text-red-400 font-mono text-sm">500 Internal Server Error</p>
                <p className="text-slate-300 text-sm">Server error occurred</p>
              </div>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Rate Limits</h3>
            <div className="space-y-2">
              <p className="text-slate-300 text-sm">• 100 requests per minute per API key</p>
              <p className="text-slate-300 text-sm">• 1000 requests per hour per API key</p>
              <p className="text-slate-300 text-sm">• Contact support for higher limits</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
