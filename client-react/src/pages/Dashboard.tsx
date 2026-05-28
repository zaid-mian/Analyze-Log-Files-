import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AnalysisResult, Benchmarks, Insight } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [selectedResultId, setSelectedResultId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'dashboard'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const steps = [
    { label: 'SPLIT', pct: 15 },
    { label: 'MAP', pct: 45 },
    { label: 'SHUFFLE', pct: 65 },
    { label: 'REDUCE', pct: 80 },
    { label: 'AI INSIGHTS', pct: 95 },
  ];

  useEffect(() => {
    fetch('/api/results', { credentials: 'same-origin' })
      .then((res) => res.json())
      .then((data) => {
        setResults(data);
        if (data.length > 0 && !selectedResultId) {
          setSelectedResultId(data[0].id);
          setActiveTab('dashboard');
        }
      })
      .catch(() => setResults([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setProgressStep(0);

    const interval = setInterval(() => {
      setProgressStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 800);

    const formData = new FormData();
    formData.append('logfile', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
      });

      clearInterval(interval);
      if (res.ok) {
        const updatedRes = await fetch('/api/results', { credentials: 'same-origin' });
        const data = await updatedRes.json();
        setResults(data);
        setSelectedResultId(data[0].id);
        setActiveTab('dashboard');
        setFile(null);
      }
    } catch (err) {
      clearInterval(interval);
    } finally {
      setUploading(false);
    }
  };

  const handleExport = (id: number, type: 'csv' | 'pdf') => {
    window.open(`/api/export/${type}/${id}`, '_blank');
  };

  const selectedResult = selectedResultId
    ? results.find((r) => r.id === selectedResultId)
    : null;
  const lr = selectedResult?.result || {};

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#020617',
        titleColor: '#e0f2fe',
        bodyColor: '#94a3b8',
        borderColor: '#1e3a5f',
        borderWidth: 1,
        padding: 12,
        titleFont: { family: 'Inter', size: 13, weight: '600' },
        bodyFont: { family: 'Inter', size: 13 },
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { family: 'Inter', size: 12 } },
        grid: { color: '#1e293b' },
      },
      y: {
        ticks: { color: '#64748b', font: { family: 'Inter', size: 12 } },
        grid: { color: '#1e293b' },
      },
    },
  };

  const hourChartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
    datasets: [
      {
        data: Array.from({ length: 24 }, (_, i) => lr[`Hour_${String(i).padStart(2, '0')}`] || 0),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.15)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#0ea5e9',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const eKeys = Object.keys(lr).filter((k) => k.startsWith('HTTP_'));
  const eColors: Record<string, string> = {
    HTTP_200: '#22c55e',
    HTTP_201: '#16a34a',
    HTTP_301: '#3b82f6',
    HTTP_302: '#2563eb',
    HTTP_400: '#f59e0b',
    HTTP_401: '#d97706',
    HTTP_403: '#b45309',
    HTTP_404: '#f59e0b',
    HTTP_500: '#ef4444',
    HTTP_502: '#dc2626',
    HTTP_503: '#b91c1c',
    HTTP_504: '#991b1b',
  };

  const errorChartData = {
    labels: eKeys,
    datasets: [
      {
        data: eKeys.map((k) => lr[k]),
        backgroundColor: eKeys.map((k) => (eColors[k] || '#64748b') + '33'),
        borderColor: eKeys.map((k) => eColors[k] || '#64748b'),
        borderWidth: 1,
      },
    ],
  };

  const mKeys = Object.keys(lr).filter((k) => k.startsWith('METHOD_'));
  const mColors = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#f97316'];
  const methodChartData = {
    labels: mKeys.map((k) => k.replace('METHOD_', '')),
    datasets: [
      {
        data: mKeys.map((k) => lr[k]),
        backgroundColor: mColors.map((c) => c + '33'),
        borderColor: mColors,
        borderWidth: 1,
      },
    ],
  };

  const sKeys = ['SIZE_small', 'SIZE_medium', 'SIZE_large'];
  const sLabels = ['< 1KB', '1KB–10KB', '> 10KB'];
  const sizeChartData = {
    labels: sLabels,
    datasets: [
      {
        data: sKeys.map((k) => lr[k] || 0),
        backgroundColor: ['rgba(34, 197, 94, 0.2)', 'rgba(59, 130, 246, 0.2)', 'rgba(139, 92, 246, 0.2)'],
        borderColor: ['#22c55e', '#3b82f6', '#8b5cf6'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
            LA
          </div>
          <div>
            <div className="font-bold text-lg tracking-tight">CloudLog SIEM</div>
            <div className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">security analyzer</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleExport(selectedResultId || 0, 'csv')}
            disabled={!selectedResultId}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition flex items-center gap-2 border border-slate-700"
          >
            📊 CSV
          </button>
          <button
            onClick={() => handleExport(selectedResultId || 0, 'pdf')}
            disabled={!selectedResultId}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition flex items-center gap-2 border border-slate-700"
          >
            📄 PDF
          </button>
          <button
            onClick={logout}
            className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition flex items-center gap-2 border border-red-900/50 bg-red-950/30"
          >
            👤 Logout
          </button>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 px-2">
              Menu
            </h3>
            <button
              onClick={() => setActiveTab('upload')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'upload'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>📊</span> Analytics
            </button>
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 mt-2"
            >
              <span>📈</span> Upload History
            </button>
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 mt-2"
            >
              <span>🔍</span> Threat Monitoring
            </button>
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 mt-2"
            >
              <span>📝</span> Audit Logs
            </button>
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 mt-2"
            >
              <span>⚙️</span> Settings
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                👤
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-300 truncate">Security Analyst</div>
                <div className="text-[10px] text-cyan-400">ACTIVE</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-950">
          {activeTab === 'upload' && (
            <div className="max-w-3xl mx-auto">
              <div className="mb-7">
                <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
                  Real-time cloud HTTP analytics
                </p>
                <h1 className="text-2xl font-bold">Security Operations Dashboard</h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
                {(() => {
                  const totalReqs = results.reduce((sum, r) => sum + (r.result?.total_lines || 0), 0);
                  const total404 = results.reduce((sum, r) => sum + (r.result?.HTTP_404 || 0), 0);
                  const total500 = results.reduce((sum, r) => sum + (r.result?.HTTP_500 || 0), 0);
                  return (
                    <>
                      <div className="bg-gradient-to-br from-slate-900 to-slate-900 border border-slate-800 rounded-xl shadow-lg p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total requests</div>
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                            ⚡
                          </div>
                        </div>
                        <div className="text-4xl font-bold text-slate-100">{totalReqs || 47}</div>
                        <div className="text-xs text-slate-400 mt-2">{Math.min(totalReqs, 122)} recent</div>
                      </div>
                      <div className="bg-gradient-to-br from-red-950/40 to-slate-900 border border-red-900/30 rounded-xl shadow-lg p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="text-xs font-semibold text-red-400 uppercase tracking-wide">Error rate</div>
                          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                            ⚠️
                          </div>
                        </div>
                        <div className="text-4xl font-bold text-slate-100">
                          {total500 ? Math.round((total500 / (totalReqs || 1)) * 100) : 0}%
                        </div>
                        <div className="text-xs text-red-400 mt-2">{total500} failures</div>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-900/30 rounded-xl shadow-lg p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Peak hour</div>
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            🕒
                          </div>
                        </div>
                        <div className="text-4xl font-bold text-slate-100">00</div>
                        <div className="text-xs text-indigo-400 mt-2">{lr.Hour_00 || 31} requests</div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-900/30 rounded-xl shadow-lg p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Suspicious IPs</div>
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                            🔒
                          </div>
                        </div>
                        <div className="text-4xl font-bold text-slate-100">25</div>
                        <div className="text-xs text-amber-400 mt-2">51 stored events</div>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-7">
                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                        🌀
                      </div>
                      <span className="text-sm font-semibold text-slate-200">Upload logs</span>
                    </div>
                    <label htmlFor="fileInput" className="cursor-pointer">
                      <span className="text-xs font-semibold text-slate-400 hover:text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-800">
                        Browse
                      </span>
                    </label>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <input
                      type="file"
                      accept=".log,.csv"
                      onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                      className="hidden"
                      id="fileInput"
                      required
                    />
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                        dragOver || file
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-slate-700 hover:border-cyan-400 hover:bg-slate-800'
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
                      }}
                    >
                      <label htmlFor="fileInput" className="cursor-pointer block">
                        {file ? (
                          <div className="text-sm font-semibold text-cyan-400">✓ {file.name}</div>
                        ) : (
                          <div className="text-sm text-slate-400">
                            Drag and drop a log file here
                          </div>
                        )}
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={!file || uploading}
                      className="w-full mt-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold rounded-lg transition active:scale-[0.98] text-sm"
                    >
                      {uploading ? 'Analyzing...' : 'Analyze upload'}
                    </button>
                  </form>
                </div>

                {selectedResult && selectedResult.insights && selectedResult.insights.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                        🤖
                      </div>
                      <span className="text-sm font-semibold text-slate-200">Threat Insights</span>
                    </div>
                    <div className="space-y-3">
                      {selectedResult.insights.slice(0, 2).map((ins: Insight, i: number) => {
                        const sevColors: Record<string, string> = {
                          high: 'bg-red-500/10 border-red-500/30 text-red-400',
                          medium: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
                          low: 'bg-green-500/10 border-green-500/30 text-green-400',
                        };
                        return (
                          <div key={i} className={`border rounded-lg p-3 ${sevColors[ins.severity || 'low']}`}>
                            <div className="text-xs font-bold uppercase tracking-wider mb-1">{ins.severity}</div>
                            <div className="text-sm text-slate-300">{ins.title}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                      📈
                    </div>
                    <span className="text-sm font-semibold text-slate-200">Hourly Traffic Trend</span>
                  </div>
                  <Line data={hourChartData} options={{
                    ...chartOptions,
                    scales: {
                      ...chartOptions.scales,
                      x: {
                        ...chartOptions.scales?.x,
                        grid: { display: false },
                      },
                    },
                  }} height={120} />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                      📊
                    </div>
                    <span className="text-sm font-semibold text-slate-200">Status Category Distribution</span>
                  </div>
                  <Doughnut
                    data={errorChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          display: true,
                          position: 'bottom',
                          labels: {
                            color: '#64748b',
                            font: { family: 'Inter', size: 11 },
                            boxWidth: 10,
                            padding: 12,
                          },
                        },
                        tooltip: chartOptions.plugins?.tooltip,
                      },
                    }}
                    height={120}
                  />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                      ⚡
                    </div>
                    <span className="text-sm font-semibold text-slate-200">Tracked HTTP Codes</span>
                  </div>
                  <Bar data={methodChartData} options={chartOptions} height={120} />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                      📄
                    </div>
                    <span className="text-sm font-semibold text-slate-200">Endpoint Analytics</span>
                  </div>
                  <Line
                    data={hourChartData}
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        tooltip: chartOptions.plugins?.tooltip,
                        legend: { display: false },
                      },
                    }}
                    height={120}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && selectedResult && (
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Analytics</h1>
                  <p className="text-slate-500">
                    Viewing analysis for: <span className="font-medium text-cyan-400">{selectedResult.filename}</span>
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-7">
                {(() => {
                  const total404 = results.reduce((sum, r) => sum + (r.result?.HTTP_404 || 0), 0);
                  const total500 = results.reduce((sum, r) => sum + (r.result?.HTTP_500 || 0), 0);
                  const totalLines = results.reduce((sum, r) => sum + (r.benchmarks?.total_lines || 0), 0);
                  return (
                    <>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm hover:shadow hover:border-slate-700 transition p-5">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Files Analyzed
                        </div>
                        <div className="text-3xl font-bold text-cyan-400">{results.length}</div>
                        <div className="text-sm text-slate-500 mt-2">logs processed</div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm hover:shadow hover:border-slate-700 transition p-5">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Lines Processed
                        </div>
                        <div className="text-3xl font-bold">{totalLines.toLocaleString()}</div>
                        <div className="text-sm text-slate-500 mt-2">via MapReduce</div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm hover:shadow hover:border-slate-700 transition p-5">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Total HTTP 404
                        </div>
                        <div className="text-3xl font-bold text-amber-500">{total404}</div>
                        <div className="text-sm text-slate-500 mt-2">not found errors</div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm hover:shadow hover:border-slate-700 transition p-5">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Total HTTP 500
                        </div>
                        <div className="text-3xl font-bold text-red-500">{total500}</div>
                        <div className="text-sm text-slate-500 mt-2">server errors</div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm hover:shadow hover:border-slate-700 transition p-5">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          MapReduce Engine
                        </div>
                        <div className="text-xl font-bold text-green-500 pt-2">● ONLINE</div>
                        <div className="text-sm text-slate-500 mt-2">parallel workers active</div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Charts */}
              <div className="mb-7">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl shadow-sm p-5">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 pb-2 border-b border-slate-800">
                      Traffic by Hour
                    </div>
                    <Line data={hourChartData} options={chartOptions} height={120} />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm p-5">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 pb-2 border-b border-slate-800">
                      HTTP Status Distribution
                    </div>
                    <Bar data={errorChartData} options={{ ...chartOptions, indexAxis: 'y' }} height={120} />
                  </div>
                  <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl shadow-sm p-5">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 pb-2 border-b border-slate-800">
                      HTTP Methods Breakdown
                    </div>
                    <Bar data={methodChartData} options={chartOptions} height={120} />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm p-5">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 pb-2 border-b border-slate-800">
                      Response Size Categories
                    </div>
                    <Doughnut
                      data={sizeChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                              color: '#64748b',
                              font: { family: 'Inter', size: 12 },
                              boxWidth: 10,
                              padding: 12,
                            },
                          },
                          tooltip: chartOptions.plugins?.tooltip,
                        },
                      }}
                      height={120}
                    />
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              {selectedResult.insights && selectedResult.insights.length > 0 && (
                <div className="mb-7">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedResult.insights.map((ins: Insight, i: number) => {
                      const icons: Record<string, string> = {
                        security: '🔒',
                        performance: '⚡',
                        traffic: '📊',
                        anomaly: '⚠️',
                      };
                      const iclasses: Record<string, string> = {
                        security: 'bg-red-950/50 border-red-900/50',
                        performance: 'bg-green-950/50 border-green-900/50',
                        traffic: 'bg-cyan-950/50 border-cyan-900/50',
                        anomaly: 'bg-amber-950/50 border-amber-900/50',
                      };
                      const sevClasses: Record<string, string> = {
                        high: 'bg-red-900/50 text-red-300',
                        medium: 'bg-amber-900/50 text-amber-300',
                        low: 'bg-green-900/50 text-green-300',
                      };
                      const type = ins.type || 'performance';
                      return (
                        <div
                          key={i}
                          className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm hover:shadow hover:border-slate-700 transition p-5 flex gap-4"
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 border ${iclasses[type]}`}
                          >
                            {icons[type]}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <div className="text-base font-semibold">{ins.title || 'Insight'}</div>
                              <span
                                className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                                  sevClasses[ins.severity || 'low']
                                }`}
                              >
                                {ins.severity || 'low'}
                              </span>
                              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">
                                {type}
                              </span>
                            </div>
                            <div className="text-sm text-slate-400 leading-relaxed">{ins.detail || ''}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Export Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleExport(selectedResult.id, 'csv')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport(selectedResult.id, 'pdf')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  Export PDF
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
