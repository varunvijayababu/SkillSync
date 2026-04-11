import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/history")
      .then(res => res.json())
      .then(setData);
  }, []);

  const chartData = {
    labels: data.map((_, i) => `Attempt ${i + 1}`),
    datasets: [
      {
        label: "ATS Score",
        data: data.map(item => item.score),
        borderWidth: 2,
      },
    ],
  };

  return (
    <div>
      <h2>Dashboard 📊</h2>

      <Line data={chartData} />

      <h3>History:</h3>
      <ul>
        {data.map((item, i) => (
          <li key={i}>
            Score: {item.score}%
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;