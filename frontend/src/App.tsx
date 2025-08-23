import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [apiStatus, setApiStatus] = useState<string>('Checking...')
  const [apiData, setApiData] = useState<any>(null)

  useEffect(() => {
    const checkAPI = async () => {
      try {
        const response = await axios.get(`${API_URL}/`)
        setApiStatus('Connected ✅')
        setApiData(response.data)
      } catch (error) {
        setApiStatus('Not Connected ❌')
        console.error('API Error:', error)
      }
    }
    checkAPI()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">🎯 SkillSync Pro</h1>
          <p className="text-xl text-gray-600 mb-8">AI-Powered Resume & Job Description Analyzer</p>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">System Status</h2>
            <div className="space-y-2">
              <p className="text-lg">
                Frontend: <span className="text-green-600 font-semibold">Operational ✅</span>
              </p>
              <p className="text-lg">
                Backend API: <span className="font-semibold">{apiStatus}</span>
              </p>
              {apiData && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <pre className="text-sm">{JSON.stringify(apiData, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Resume text analysis</li>
              <li>Job description parsing</li>
              <li>Skill gap identification</li>
              <li>AI-powered skill recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
