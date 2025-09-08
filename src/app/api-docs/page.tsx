"use client";

import { motion } from "framer-motion";
import { 
  Code, 
  Copy, 
  Check, 
  ExternalLink, 
  Key, 
  Globe, 
  FileText,
  ArrowLeft,
  Terminal,
  Zap
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function APIDocumentationPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const cURLExample = `curl -X POST "https://your-domain.com/api/predict/your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "inputs": [1.2, 3.4, 5.6, 7.8, 9.0, 1.1, 2.2, 3.3, 4.4, 5.5, 6.6, 7.7]
  }'`;

  const javascriptExample = `const response = await fetch('https://your-domain.com/api/predict/your-api-key', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    inputs: [1.2, 3.4, 5.6, 7.8, 9.0, 1.1, 2.2, 3.3, 4.4, 5.5, 6.6, 7.7]
  })
});

const data = await response.json();
console.log(data.prediction);`;

  const pythonExample = `import requests

url = "https://your-domain.com/api/predict/your-api-key"
data = {
    "inputs": [1.2, 3.4, 5.6, 7.8, 9.0, 1.1, 2.2, 3.3, 4.4, 5.5, 6.6, 7.7]
}

response = requests.post(url, json=data)
result = response.json()
print(result["prediction"])`;

  return (
    <div className="min-h-screen bg-ml-dark-50">
      {/* Header */}
      <div className="bg-ml-dark-100 border-b border-ml-dark-300">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 text-ml-dark-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-ml-dark-300"></div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-ml-blue-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">API Documentation</h1>
                  <p className="text-sm text-ml-dark-400">MLStudio Prediction API</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-green-400/20 text-green-400 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full inline-block mr-2"></div>
                API Active
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Overview', icon: Globe },
                  { id: 'authentication', label: 'Authentication', icon: Key },
                  { id: 'endpoints', label: 'Endpoints', icon: Zap },
                  { id: 'examples', label: 'Code Examples', icon: Code },
                  { id: 'responses', label: 'Responses', icon: FileText },
                  { id: 'errors', label: 'Error Handling', icon: Terminal }
                ].map(({ id, label, icon: Icon }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="flex items-center gap-2 px-3 py-2 text-ml-dark-400 hover:text-white hover:bg-ml-dark-200 rounded-lg transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Overview */}
            <motion.section
              id="overview"
              className="bg-ml-dark-100 rounded-lg border border-ml-dark-300 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-ml-blue-50" />
                Overview
              </h2>
              <p className="text-ml-dark-300 mb-4">
                The MLStudio Prediction API allows you to make predictions using your trained machine learning models. 
                Each deployed model gets its own unique API endpoint with authentication via API keys.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-ml-dark-200 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Base URL</h3>
                  <code className="text-ml-blue-50 bg-ml-dark-300 px-2 py-1 rounded text-sm">
                    https://your-domain.com/api/predict/
                  </code>
                </div>
                <div className="bg-ml-dark-200 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Authentication</h3>
                  <p className="text-ml-dark-400 text-sm">API Key in URL path</p>
                </div>
              </div>
            </motion.section>

            {/* Authentication */}
            <motion.section
              id="authentication"
              className="bg-ml-dark-100 rounded-lg border border-ml-dark-300 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Key className="w-6 h-6 text-ml-blue-50" />
                Authentication
              </h2>
              <p className="text-ml-dark-300 mb-4">
                Authentication is handled via API keys embedded in the URL path. Each deployed model gets a unique API key.
              </p>
              
              <div className="bg-ml-dark-200 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">API Key Format</h3>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-ml-dark-300 text-ml-blue-50 p-2 rounded text-sm font-mono">
                    ml_1234567890_abcdef123
                  </code>
                  <button
                    onClick={() => copyToClipboard('ml_1234567890_abcdef123', 'api-key')}
                    className="px-3 py-2 bg-ml-blue-50 text-white rounded hover:bg-ml-blue-100 transition-colors"
                  >
                    {copiedSection === 'api-key' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-ml-dark-400 mt-2">
                  Format: ml_[timestamp]_[random_string]
                </p>
              </div>
            </motion.section>

            {/* Endpoints */}
            <motion.section
              id="endpoints"
              className="bg-ml-dark-100 rounded-lg border border-ml-dark-300 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-ml-blue-50" />
                Endpoints
              </h2>
              
              <div className="space-y-4">
                <div className="bg-ml-dark-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2 py-1 bg-green-400 text-black text-xs font-mono rounded">POST</span>
                    <code className="text-ml-blue-50 font-mono">/api/predict/{`{api_key}`}</code>
                  </div>
                  <p className="text-ml-dark-300 mb-3">
                    Make a prediction using your deployed model. Send input features as a JSON array.
                  </p>
                  
                  <h4 className="font-semibold text-white mb-2">Request Body</h4>
                  <div className="bg-ml-dark-300 rounded p-3 mb-3">
                    <pre className="text-ml-blue-50 text-sm">{`{
  "inputs": [1.2, 3.4, 5.6, 7.8, 9.0, 1.1, 2.2, 3.3, 4.4, 5.5, 6.6, 7.7]
}`}</pre>
                  </div>
                  
                  <h4 className="font-semibold text-white mb-2">Response</h4>
                  <div className="bg-ml-dark-300 rounded p-3">
                    <pre className="text-ml-blue-50 text-sm">{`{
  "prediction": 42.5,
  "modelName": "linear_regression_v1",
  "timestamp": 1640995200000,
  "targetRange": {
    "min": 10.2,
    "max": 95.8
  }
}`}</pre>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Code Examples */}
            <motion.section
              id="examples"
              className="bg-ml-dark-100 rounded-lg border border-ml-dark-300 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Code className="w-6 h-6 text-ml-blue-50" />
                Code Examples
              </h2>
              
              <div className="space-y-6">
                {/* cURL */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">cURL</h3>
                    <button
                      onClick={() => copyToClipboard(cURLExample, 'curl')}
                      className="flex items-center gap-1 px-3 py-1 bg-ml-blue-50 text-white rounded hover:bg-ml-blue-100 transition-colors text-sm"
                    >
                      {copiedSection === 'curl' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      Copy
                    </button>
                  </div>
                  <div className="bg-ml-dark-300 rounded p-4">
                    <pre className="text-ml-blue-50 text-sm overflow-x-auto">{cURLExample}</pre>
                  </div>
                </div>

                {/* JavaScript */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">JavaScript</h3>
                    <button
                      onClick={() => copyToClipboard(javascriptExample, 'javascript')}
                      className="flex items-center gap-1 px-3 py-1 bg-ml-blue-50 text-white rounded hover:bg-ml-blue-100 transition-colors text-sm"
                    >
                      {copiedSection === 'javascript' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      Copy
                    </button>
                  </div>
                  <div className="bg-ml-dark-300 rounded p-4">
                    <pre className="text-ml-blue-50 text-sm overflow-x-auto">{javascriptExample}</pre>
                  </div>
                </div>

                {/* Python */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">Python</h3>
                    <button
                      onClick={() => copyToClipboard(pythonExample, 'python')}
                      className="flex items-center gap-1 px-3 py-1 bg-ml-blue-50 text-white rounded hover:bg-ml-blue-100 transition-colors text-sm"
                    >
                      {copiedSection === 'python' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      Copy
                    </button>
                  </div>
                  <div className="bg-ml-dark-300 rounded p-4">
                    <pre className="text-ml-blue-50 text-sm overflow-x-auto">{pythonExample}</pre>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Responses */}
            <motion.section
              id="responses"
              className="bg-ml-dark-100 rounded-lg border border-ml-dark-300 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-ml-blue-50" />
                Response Format
              </h2>
              
              <div className="space-y-4">
                <div className="bg-ml-dark-200 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Success Response (200)</h3>
                  <div className="bg-ml-dark-300 rounded p-3">
                    <pre className="text-ml-blue-50 text-sm">{`{
  "prediction": 42.5,
  "modelName": "linear_regression_v1",
  "timestamp": 1640995200000,
  "targetRange": {
    "min": 10.2,
    "max": 95.8
  }
}`}</pre>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <code className="text-ml-blue-50 bg-ml-dark-300 px-2 py-1 rounded text-xs">prediction</code>
                      <span className="text-ml-dark-400 text-sm">The predicted value</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-ml-blue-50 bg-ml-dark-300 px-2 py-1 rounded text-xs">modelName</code>
                      <span className="text-ml-dark-400 text-sm">Name of the model used</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-ml-blue-50 bg-ml-dark-300 px-2 py-1 rounded text-xs">timestamp</code>
                      <span className="text-ml-dark-400 text-sm">Unix timestamp of the prediction</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-ml-blue-50 bg-ml-dark-300 px-2 py-1 rounded text-xs">targetRange</code>
                      <span className="text-ml-dark-400 text-sm">Min/max values from training data</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Error Handling */}
            <motion.section
              id="errors"
              className="bg-ml-dark-100 rounded-lg border border-ml-dark-300 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Terminal className="w-6 h-6 text-ml-blue-50" />
                Error Handling
              </h2>
              
              <div className="space-y-4">
                <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-4">
                  <h3 className="font-semibold text-red-400 mb-2">401 - Unauthorized</h3>
                  <p className="text-ml-dark-300 mb-2">Invalid or missing API key</p>
                  <div className="bg-ml-dark-300 rounded p-3">
                    <pre className="text-red-400 text-sm">{`{
  "error": "Invalid API key"
}`}</pre>
                  </div>
                </div>

                <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-4">
                  <h3 className="font-semibold text-red-400 mb-2">400 - Bad Request</h3>
                  <p className="text-ml-dark-300 mb-2">Invalid input format or missing required fields</p>
                  <div className="bg-ml-dark-300 rounded p-3">
                    <pre className="text-red-400 text-sm">{`{
  "error": "Invalid input format. Expected array of numbers."
}`}</pre>
                  </div>
                </div>

                <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-4">
                  <h3 className="font-semibold text-red-400 mb-2">503 - Service Unavailable</h3>
                  <p className="text-ml-dark-300 mb-2">API is inactive or model not found</p>
                  <div className="bg-ml-dark-300 rounded p-3">
                    <pre className="text-red-400 text-sm">{`{
  "error": "API is not active"
}`}</pre>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Footer */}
            <motion.div
              className="bg-ml-dark-100 rounded-lg border border-ml-dark-300 p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
              <p className="text-ml-dark-400 mb-4">
                If you have questions or need assistance with the API, please contact our support team.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-ml-blue-50 text-white rounded-lg hover:bg-ml-blue-100 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Back to Dashboard
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
