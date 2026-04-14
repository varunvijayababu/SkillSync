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

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Track version-by-version career readiness improvement.</p>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        {loading ? (
          <Card title="Loading">
            <p className="text-slate-500">Fetching your analysis history...</p>
          </Card>
        ) : (
          <>
            <Card title="Progress Graph" subtitle="ATS and role readiness over resume versions">
              {data.length > 0 ? <Line data={chartData} /> : <p className="text-slate-500">No data yet.</p>}
            </Card>

            {latest && (
              <Card title={`Latest Snapshot (${latest.versionLabel || "v?"})`} subtitle={latest.role || "Role not set"}>
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
                <p className="text-slate-500">No versions available yet.</p>
              ) : (
                <ul className="space-y-3">
                  {data.map((item) => (
                    <li
                      key={item._id}
                      className="border border-slate-200 rounded-lg px-4 py-3 flex flex-wrap justify-between gap-3"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {item.versionLabel || `v${item.versionNumber || 0}`} - {item.role || "Unknown Role"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.createdAt ? new Date(item.createdAt).toLocaleString() : "No timestamp"}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-slate-700">
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