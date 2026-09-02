import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { oneDark } from "@codemirror/theme-one-dark";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onRun: () => void;
  height?: string;
}

export function SqlEditor({ value, onChange, onRun, height = "200px" }: Props) {
  return (
    <div className="rounded-lg overflow-hidden border border-border bg-[#0f1418]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card/60">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="mono text-xs text-muted-foreground">query.sql</span>
        </div>
        <button
          type="button"
          onClick={onRun}
          className="mono text-xs rounded bg-primary px-2.5 py-1.5 font-medium text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Run ↵ <span className="ml-1 opacity-70">⌘↵</span>
        </button>
      </div>
      <CodeMirror
        value={value}
        height={height}
        theme={oneDark}
        extensions={[sql()]}
        onChange={onChange}
        basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: false }}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            onRun();
          }
        }}
      />
    </div>
  );
}
