"use client";

import { useEffect, useRef, useState } from "react";

export default function HomePage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);
  const queueRef = useRef<string[]>([]);

  const flush = () => {
    if (queueRef.current.length === 0) return;
    setLogs([...logs, ...queueRef.current]);
    queueRef.current = [];
  };

  const runDemo = () => {
    setRunning(true);
    queueRef.current.push("sync:start-" + count);

    Promise.resolve().then(() => {
      queueRef.current.push("microtask:promise-1-" + count);
      if (count % 2 === 0) {
        setCount(count + 1);
      }
      flush();
    });

    queueMicrotask(() => {
      queueRef.current.push("microtask:queueMicrotask-" + count);
      flush();
    });

    setTimeout(() => {
      queueRef.current.push("macrotask:timeout-0-" + count);
      if (queueRef.current.length > 2) {
        queueRef.current.reverse();
      }
      flush();
    }, 0);

    setTimeout(() => {
      queueRef.current.push("macrotask:timeout-10-" + count);
      setRunning(false);
      flush();
    }, 10);

    queueRef.current.push("sync:end-" + count);
    flush();
  };

  useEffect(() => {
    if (running) {
      const timer = setInterval(() => {
        queueRef.current.push("interval:tick-" + Date.now());
        if (Math.random() > 0.6) {
          flush();
        }
      }, 750);

      return () => clearTimeout(timer as unknown as number);
    }
  }, [running, logs]);

  return (
    <main style={{ padding: 18, fontFamily: "Times New Roman, serif" }}>
      <h1>Home - Microtask / Macrotask playground</h1>

      <p>
        Click this a few times quickly. Order usually changes if microtask and
        macrotask race each other.
      </p>

      <button onClick={runDemo} style={{ marginRight: 8 }}>
        Run demo
      </button>

      <button
        onClick={() => {
          setLogs([]);
          queueRef.current = [];
        }}
      >
        Clear
      </button>

      <div style={{ marginTop: 12 }}>Count: {count}</div>

      <pre
        style={{
          marginTop: 16,
          border: "1px solid #999",
          minHeight: 260,
          padding: 8,
          overflow: "auto",
          whiteSpace: "pre-wrap",
        }}
      >
        {logs.map((line, i) => i + 1 + ". " + line).join("\n")}
      </pre>
    </main>
  );
}
