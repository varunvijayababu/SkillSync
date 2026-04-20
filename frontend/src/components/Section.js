import Badge from "./Badge";
import { BarChart2, Sparkles, Loader2 } from "lucide-react";

function Section({ title, items = [], accent = "text-blue-700 dark:text-blue-400", display = "list", badgeVariant = "secondary", onRewrite, rewritingIndex }) {
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
            <li key={`${item}-${idx}`} className="flex items-start justify-between group py-1">
              <span className="flex-1">{item}</span>
              {onRewrite && (
                <button
                  type="button"
                  onClick={() => onRewrite(item, idx)}
                  disabled={rewritingIndex === idx}
                  className="opacity-0 group-hover:opacity-100 ml-3 shrink-0 text-indigo-500 hover:text-indigo-600 transition-opacity"
                  title="Rewrite with AI"
                >
                  {rewritingIndex === idx ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Section;
