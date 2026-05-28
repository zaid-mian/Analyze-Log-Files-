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
        backgroundColor: '#0f172a',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        titleFont: { family: 'Inter', size: 13, weight: '600' },
        bodyFont: { family: 'Inter', size: 13 },
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { family: 'Inter', size: 12 } },
        grid: { color: '#e2e8f0' },
      },
      y: {
        ticks: { color: '#64748b', font: { family: 'Inter', size: 12 } },
        grid: { color: '#e2e8f0' },
      },
    },
  };

  const hourChartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
    datasets: [
      {
        data: Array.from({ length: 24 }, (_, i) => lr[`Hour_${String(i).padStart(2, '0')}`] || 0),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#2563eb',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const eKeys = Object.keys(lr).filter((k) => k.startsWith('HTTP_'));
  const eColors: Record<string, string> = {
    HTTP_200: '#10b981',
    HTTP_201: '#059669',
    HTTP_301: '#2563eb',
    HTTP_302: '#1d4ed8',
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
        backgroundColor: eKeys.map((k) => (eColors[k] || '#64748b') + '22'),
        borderColor: eKeys.map((k) => eColors[k] || '#64748b'),
        borderWidth: 1,
      },
    ],
  };

  const mKeys = Object.keys(lr).filter((k) => k.startsWith('METHOD_'));
  const mColors = ['#10b981', '#2563eb', '#6366f1', '#f59e0b', '#ef4444', '#f97316'];
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
        backgroundColor: ['rgba(16, 185, 129, 0.2)', 'rgba(37, 99, 235, 0.2)', 'rgba(99, 102, 241, 0.2)'],
        borderColor: ['#10b981', '#2563eb', '#6366f1'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
            LA
          </div>
          <div className="font-bold text-lg tracking-tight">LogAnalyzer</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500">
            session: <span className="font-semibold text-slate-900">{user?.email}</span>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 px-2">
              Menu
            </h3>
            <button
              onClick={() => setActiveTab('upload')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'upload'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>📤</span> Upload New File
            </button>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 px-2">
              History ({results.length})
            </h3>
            <div className="flex flex-col gap-2 max-h-[calc(100vh-250px)] overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    setSelectedResultId(result.id);
                    setActiveTab('dashboard');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition text-left ${
                    selectedResultId === result.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{result.filename}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(result.created_at || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'upload' && (
            <div className="max-w-3xl mx-auto">
              <h1 className="text-2xl font-bold mb-1">Upload & Analyze</h1>
              <p className="text-slate-500 mb-7 leading-relaxed">
                Upload a raw Apache/Nginx .log file. The MapReduce engine will process it in parallel across multiple workers and generate AI-powered security + performance insights.
              </p>

              <div className="bg-white border border-slate-200 rounded-xl shadow p-8">
                <div className="grid grid-cols-4 gap-4 mb-8">
                  {[
                    { num: '01', name: 'Split', desc: 'Chunk file into workers' },
                    { num: '02', name: 'Map', desc: 'Parallel line parsing' },
                    { num: '03', name: 'Shuffle', desc: 'Group by key' },
                    { num: '04', name: 'Reduce', desc: 'Aggregate counts' },
                  ].map((step, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-4 text-center">
                      <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                        {step.num}
                      </div>
                      <div className="text-sm font-semibold mb-1">{step.name}</div>
                      <div className="text-xs text-slate-500">{step.desc}</div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit}>
                  <div
                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
                      dragOver || file ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-blue-400'
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
                    <input
                    type="file"
                    accept=".log,.csv"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    className="hidden"
                    id="fileInput"
                    required
                  />
                  <label htmlFor="fileInput" className="cursor-pointer">
                    <span className="text-5xl block mb-4">📋</span>
                    <div className="text-base font-medium mb-2">
                      Drop your .log or .csv file here or click to browse
                    </div>
                    <div className="text-sm text-slate-500">Apache / Nginx combined log format (or compatible CSV) supported</div>
                      {file && (
                        <div className="mt-4 text-sm font-semibold text-blue-600">✓ {file.name}</div>
                      )}
                    </label>
                  </div>

                  {uploading && (
                    <div className="mt-6">
                      <div className="flex justify-between mb-3">
                        {steps.map((s, i) => (
                          <div
                            key={i}
                            className={`text-xs font-semibold ${
                              i < progressStep ? 'text-green-600' : i === progressStep ? 'text-blue-600' : 'text-slate-400'
                            }`}
                          >
                            {s.label}
                          </div>
                        ))}
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${steps[progressStep]?.pct || 0}%` }}
                        />
                      </div>
                      <div className="mt-3 text-center text-sm text-slate-500">Initializing pipeline...</div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!file || uploading}
                    className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition active:scale-[0.98]"
                  >
                    {uploading ? 'Processing...' : 'Run MapReduce + AI Analysis →'}
                  </button>
                </form>

                <div className="grid grid-cols-4 gap-3 mt-6">
                  {[
                    { title: 'Format', desc: 'Apache / Nginx combined log' },
                    { title: 'Engine', desc: 'Python multiprocessing.Pool' },
                    { title: 'AI Model', desc: 'Claude Sonnet' },
                    { title: 'Storage', desc: 'SQLite' },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-3">
                      <div className="text-sm font-semibold mb-1">{item.title}</div>
                      <div className="text-xs text-slate-500">{item.desc}</div>
                    </div>
                  ))}
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
                    Viewing analysis for: <span className="font-medium text-blue-600">{selectedResult.filename}</span>
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
                      <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow hover:border-slate-300 transition p-5">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Files Analyzed
                        </div>
                        <div className="text-3xl font-bold text-blue-600">{results.length}</div>
                        <div className="text-sm text-slate-500 mt-2">logs processed</div>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow hover:border-slate-300 transition p-5">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Lines Processed
                        </div>
                        <div className="text-3xl font-bold">{totalLines.toLocaleString()}</div>
                        <div className="text-sm text-slate-500 mt-2">via MapReduce</div>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow hover:border-slate-300 transition p-5">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Total HTTP 404
                        </div>
                        <div className="text-3xl font-bold text-amber-500">{total404}</div>
                        <div className="text-sm text-slate-500 mt-2">not found errors</div>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow hover:border-slate-300 transition p-5">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Total HTTP 500
                        </div>
                        <div className="text-3xl font-bold text-red-500">{total500}</div>
                        <div className="text-sm text-slate-500 mt-2">server errors</div>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow hover:border-slate-300 transition p-5">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          MapReduce Engine
                        </div>
                        <div className="text-xl font-bold text-green-600 pt-2">● ONLINE</div>
                        <div className="text-sm text-slate-500 mt-2">parallel workers active</div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Benchmarks */}
              <div className="mb-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    MapReduce Pipeline
                  </div>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(() => {
                    const lb = selectedResult.benchmarks || ({} as Benchmarks);
                    const tTotal = lb.t_total || 0.001;
                    const pipelineSteps = [
                      { key: 't_split', label: '01 SPLIT', color: '#10b981' },
                      { key: 't_map', label: '02 MAP', color: '#2563eb' },
                      { key: 't_shuffle', label: '03 SHUFFLE', color: '#6366f1' },
                      { key: 't_reduce', label: '04 REDUCE', color: '#f59e0b' },
                    ];
                    return pipelineSteps.map((step) => {
                      const t = lb[step.key as keyof Benchmarks] || 0;
                      const pct = Math.min(Math.round((Number(t) / tTotal) * 100), 100);
                      return (
                        <div key={step.key} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                            {step.label}
                          </div>
                          <div className="text-2xl font-bold">
                            {t}
                            <span className="text-sm font-normal text-slate-500 ml-1">sec</span>
                          </div>
                          <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000"
                              style={{ width: `${pct}%`, backgroundColor: step.color }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Speed Card */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-7">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    PROCESSING SPEED
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {(selectedResult.benchmarks?.lines_per_sec || 0).toLocaleString()}{' '}
                    <span className="text-sm font-normal text-slate-500">lines/sec</span>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>0</span>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                          style={{
                            width: `${Math.min(
                              Math.round(((selectedResult.benchmarks?.lines_per_sec || 0) / 50000) * 100),
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <span>50k</span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    {selectedResult.benchmarks?.num_workers || 0} workers | {selectedResult.benchmarks?.num_chunks || 0} chunks |{' '}
                    {(selectedResult.benchmarks?.total_lines || 0).toLocaleString()} lines
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="mb-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Analytics
                  </div>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">
                      Traffic by Hour
                    </div>
                    <Line data={hourChartData} options={chartOptions} height={120} />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">
                      HTTP Status Distribution
                    </div>
                    <Bar data={errorChartData} options={{ ...chartOptions, indexAxis: 'y' }} height={120} />
                  </div>
                  <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">
                      HTTP Methods Breakdown
                    </div>
                    <Bar data={methodChartData} options={chartOptions} height={120} />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">
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
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                      AI-Powered Insights
                    </div>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedResult.insights.map((ins: Insight, i: number) => {
                      const icons: Record<string, string> = {
                        security: '🔒',
                        performance: '⚡',
                        traffic: '📊',
                        anomaly: '⚠️',
                      };
                      const iclasses: Record<string, string> = {
                        security: 'bg-red-50 border-red-100',
                        performance: 'bg-green-50 border-green-100',
                        traffic: 'bg-blue-50 border-blue-100',
                        anomaly: 'bg-amber-50 border-amber-100',
                      };
                      const sevClasses: Record<string, string> = {
                        high: 'bg-red-100 text-red-700',
                        medium: 'bg-amber-100 text-amber-700',
                        low: 'bg-green-100 text-green-700',
                      };
                      const type = ins.type || 'performance';
                      return (
                        <div
                          key={i}
                          className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow hover:border-slate-300 transition p-5 flex gap-4"
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
                              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                                {type}
                              </span>
                            </div>
                            <div className="text-sm text-slate-600 leading-relaxed">{ins.detail || ''}</div>
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
