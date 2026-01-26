"use client";

import { useState } from "react";

export default function CreateUserPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const createUser = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/setup/create-user", {
        method: "POST",
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🚀 Create SwissOne Dev User
        </h1>

        <p className="text-gray-600 mb-6">
          Click the button below to create the dev user with admin privileges.
        </p>

        <button
          onClick={createUser}
          disabled={loading}
          className="w-full px-6 py-3 text-lg font-semibold rounded-lg bg-primary-700 text-white hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mb-6"
        >
          {loading ? "Creating User..." : "Create Dev User"}
        </button>

        {result && (
          <div
            className={`p-4 rounded-lg ${
              result.success
                ? "bg-green-50 border border-green-200 text-green-800"
                : result.error
                ? "bg-red-50 border border-red-200 text-red-800"
                : "bg-yellow-50 border border-yellow-200 text-yellow-800"
            }`}
          >
            {result.success ? (
              <div>
                <h2 className="font-bold text-lg mb-2">✅ Success!</h2>
                <p className="mb-2">{result.message}</p>
                {result.email && (
                  <div className="mt-4 space-y-1">
                    <p>
                      <strong>Email:</strong> {result.email}
                    </p>
                    <p>
                      <strong>Username:</strong> {result.username}
                    </p>
                    {result.password && (
                      <p>
                        <strong>Password:</strong> {result.password}
                      </p>
                    )}
                    <p>
                      <strong>Role:</strong> {result.role || "admin"}
                    </p>
                  </div>
                )}
                <a
                  href="/login"
                  className="mt-4 inline-block px-4 py-2 bg-primary-700 text-white rounded hover:bg-primary-800"
                >
                  Go to Login →
                </a>
              </div>
            ) : result.warning ? (
              <div>
                <h2 className="font-bold text-lg mb-2">⚠️ Warning</h2>
                <p className="mb-2">{result.message}</p>
                {result.sql && (
                  <div className="mt-4">
                    <p className="font-semibold mb-2">Run this SQL in Supabase:</p>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      {result.sql}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="font-bold text-lg mb-2">❌ Error</h2>
                <p>{result.message || result.error}</p>
                {result.sql && (
                  <div className="mt-4">
                    <p className="font-semibold mb-2">Run this SQL in Supabase:</p>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      {result.sql}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Dev User Details:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li><strong>Email:</strong> petermvita@hotmail.com</li>
            <li><strong>Username:</strong> pmvita</li>
            <li><strong>Password:</strong> admin123</li>
            <li><strong>Role:</strong> admin</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

