"use client";

import { useEffect, useRef, useState } from "react";
import type { TranscriptEntry } from "@/lib/transcript";

type Frame = { text: string; delay: number };

function framesFor(entries: TranscriptEntry[]): Frame[] {
  const frames: Frame[] = [];
  let text = "";
  for (const entry of entries) {
    frames.push({ text, delay: 500 });
    const typed = `$ ${entry.command}`;
    for (let index = 1; index <= typed.length; index += 1) {
      frames.push({ text: text + typed.slice(0, index), delay: 25 });
    }
    text += `${typed}\n`;
    const lines = entry.output.replace(/\s+$/, "").split("\n");
    for (const line of lines) {
      text += `${line}\n`;
      frames.push({ text, delay: line === "" ? 40 : 45 });
    }
    frames.push({ text, delay: 700 });
  }
  return frames;
}

export function TerminalPlayer({ entries, plain }: { entries: TranscriptEntry[]; plain: string }) {
  const [reduce, setReduce] = useState(false);
  const [ready, setReady] = useState(false);
  const [text, setText] = useState("");
  const [run, setRun] = useState(0);
  const scroller = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(media.matches);
    apply();
    setReady(true);
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (reduce) {
      setText(plain);
      return;
    }
    const frames = framesFor(entries);
    let index = 0;
    let timer = 0;
    let cancelled = false;
    setText("");
    const step = () => {
      if (cancelled) return;
      if (index >= frames.length) return;
      const frame = frames[index];
      index += 1;
      setText(frame.text);
      timer = window.setTimeout(step, frame.delay);
    };
    timer = window.setTimeout(step, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [entries, plain, ready, reduce, run]);

  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [text]);

  return (
    <div className="terminal">
      <div className="terminal-bar">
        <span>Recorded session</span>
        <button type="button" className="btn btn-secondary" onClick={() => setRun((value) => value + 1)}>
          Replay
        </button>
      </div>
      <pre ref={scroller} aria-hidden="true">
        {text}
        <span className={reduce ? "cursor static" : "cursor"} />
      </pre>
      <p className="sr-only">{plain}</p>
    </div>
  );
}
