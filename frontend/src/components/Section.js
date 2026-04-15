import Badge from "./Badge";
import { BarChart2 } from "lucide-react";

function Section({ title, items = [], accent = "text-blue-700 dark:text-blue-400", display = "list", badgeVariant = "secondary" }) {
  return (
    <section>
      <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${accent}`}>{title}</h4>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/20">
          <BarChart2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">
            No insights yet. Upload a resume to get started 🚀
          </p>
        </div>
      ) : display === "badges" ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <Badge key={`${item}-${idx}`} variant={badgeVariant}>
              {item}
            </Badge>
          ))}
        </div>
      ) : (
        <ul className="list-disc ml-5 space-y-1 text-sm text-gray-600 dark:text-gray-300">
          {items.map((item, idx) => (
            <li key={`${item}-${idx}`}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Section;
