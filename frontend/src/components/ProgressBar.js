function ProgressBar({ value = 0, label = "Progress", color }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const computedColor =
    color ||
    (safeValue < 40 ? "bg-gradient-to-r from-red-400 to-red-600" : safeValue <= 70 ? "bg-gradient-to-r from-amber-400 to-amber-600" : "bg-gradient-to-r from-green-400 to-green-600");

  return (
    <div className="mb-4">
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label} — {value}%
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div
          className={`h-3 rounded-full shadow-lg ${computedColor.includes("bg-") ? computedColor : `bg-${computedColor}`} transition-all duration-700 ease-out`}
          style={{ width: `${safeValue}%` }}
        ></div>
      </div>
    </div>
  );
}

export default ProgressBar;
