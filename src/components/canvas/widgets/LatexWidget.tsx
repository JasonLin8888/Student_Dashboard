import { useMemo, useState } from 'react';
import { Copy } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const EXAMPLE = `\\documentclass{article}\n\\begin{document}\nThe quadratic formula is:\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\\end{document}`;

export default function LatexWidget() {
  const [code, setCode] = useState(EXAMPLE);
  const [copied, setCopied] = useState(false);

  const preview = useMemo(() => {
    return code
      .split('\n')
      .map((line) => {
        const displayMath = line.trim().match(/^\$\$(.+)\$\$$/);
        if (displayMath) {
          try {
            return `<div class=\"my-2\">${katex.renderToString(displayMath[1], { displayMode: true, throwOnError: false })}</div>`;
          } catch {
            return `<p class=\"text-red-500 text-xs\">${displayMath[1]}</p>`;
          }
        }

        const escaped = line
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');

        return `<p class=\"text-xs text-gray-700\">${escaped}</p>`;
      })
      .join('');
  }, [code]);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-2 overflow-hidden">
      <div className="flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">LaTeX Source</p>
          <button onClick={copy} className="text-[10px] text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
            <Copy size={11} />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 min-h-0 resize-none text-[11px] font-mono border border-gray-200 rounded-lg p-2 outline-none focus:border-indigo-400"
        />
      </div>
      <div className="min-h-0 overflow-auto border border-gray-200 rounded-lg p-2 bg-white">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Preview</p>
        <div dangerouslySetInnerHTML={{ __html: preview }} />
      </div>
    </div>
  );
}
