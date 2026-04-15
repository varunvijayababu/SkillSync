import { useEffect, useState } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { TrendingUp, Target, AlertTriangle } from "lucide-react";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import { fetchHistory } from "../services/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const history = await fetchHistory();
      setData(Array.isArray(history) ? history : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load analysis history.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: data.map((item) => item.versionLabel || `v${item.versionNumber || 0}`),
    datasets: [
      {
        label: "ATS Score",
        data: data.map((item) => item.score || 0),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        tension: 0.3,
      },
      {
        label: "Role Readiness",
        data: data.map((item) => item.roleReadinessPercentage || 0),
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 74, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const latest = data[data.length - 1];
  const previous = data.length > 1 ? data[data.length - 2] : null;
  const trend = latest && previous ? (latest.score || 0) - (previous.score || 0) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Track version-by-version career readiness improvement.</p>
        </div>

        {error && <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-2xl">{error}</div>}

        {loading ? (
          <Card className="flex flex-col gap-4 py-8">
            <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </Card>
        ) : (
          <>
            <Card title="Progress Graph" subtitle="ATS and role readiness over resume versions">
              {data.length > 0 ? <Line data={chartData} /> : <p className="text-slate-500">No data yet.</p>}
            </Card>

            {latest && (
              <Card title={`Latest Snapshot (${latest.versionLabel || "v?"})`} subtitle={latest.role || "Role not set"}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur shadow-sm flex items-center space-x-4 transition-all hover:-translate-y-1 hover:shadow-md p-6">
                    <TrendingUp className="w-10 h-10 text-blue-500" />
                    <div>
                      <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{latest.score || 0}%</p>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">ATS Score</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur shadow-sm flex items-center space-x-4 transition-all hover:-translate-y-1 hover:shadow-md p-6">
                    <Target className="w-10 h-10 text-emerald-500" />
                    <div>
                      <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{latest.roleReadinessPercentage || 0}%</p>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Readiness</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur shadow-sm flex items-center space-x-4 transition-all hover:-translate-y-1 hover:shadow-md p-6">
                    <AlertTriangle className="w-10 h-10 text-amber-500" />
                    <div>
                      <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{latest.missingSkills?.length || 0}</p>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Missing Skills</p>
                    </div>
                  </div>
                </div>
                <p className={`text-sm font-medium mb-6 ${trend >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  Improvement trend: {trend >= 0 ? "+" : ""}{trend}%
                </p>
                <div className="space-y-4">
                  <ProgressBar value={latest.score || 0} label="ATS score" color="bg-blue-500" />
                  <ProgressBar
                    value={latest.roleReadinessPercentage || 0}
                    label="Role readiness"
                    color="bg-emerald-500"
                  />
                </div>
              </Card>
            )}

            <Card title="Resume Versions" subtitle="Historical analyses">
              {data.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No versions available yet.</p>
              ) : (
                <ul className="space-y-4">
                  {data.map((item) => (
                    <li
                      key={item._id}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 flex flex-wrap justify-between gap-3 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm"
                    >
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {item.versionLabel || `v${item.versionNumber || 0}`} - {item.role || "Unknown Role"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.createdAt ? new Date(item.createdAt).toLocaleString() : "No timestamp"}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        ATS: {item.score || 0}% | Readiness: {item.roleReadinessPercentage || 0}%
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;