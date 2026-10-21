import { transcriptPlain, type Transcript } from "@/lib/transcript";
import { TerminalPlayer } from "./terminal-player";

export function TerminalDemo({ transcript }: { transcript: Transcript }) {
  const plain = transcriptPlain(transcript.entries);
  const recorded = transcript.recordedAt.slice(0, 10);
  return (
    <div>
      <p className="mb-4 max-w-[68ch] text-muted">
        Recorded {recorded}. The text below is the process output from that run.
      </p>
      <div className="terminal-live">
        <TerminalPlayer entries={transcript.entries} plain={plain} />
      </div>
      <div className="terminal terminal-fallback">
        <div className="terminal-bar">
          <span>Recorded session</span>
        </div>
        <pre>{plain}</pre>
      </div>
    </div>
  );
}
