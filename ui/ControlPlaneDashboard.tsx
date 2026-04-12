import * as React from "react";
import {
  Activity,
  Flame,
  Radio,
  ShieldAlert,
  Trash2,
  KeyRound,
  Bot,
  Cpu,
  Sparkles,
} from "lucide-react";
import {
  DotFilledIcon,
  LightningBoltIcon,
  MixerHorizontalIcon,
} from "@radix-ui/react-icons";

type StreamEvent = {
  id: number;
  channel: string;
  time: string;
  payload: string;
  tone: "cyan" | "pink";
};

const NODE_LIST = [
  { name: "Clipsflow", role: "Media", icon: Bot },
  { name: "Stix Magic", role: "Text Synth", icon: Sparkles },
  { name: "Pupbot", role: "Snag Engine", icon: Cpu },
];

const BOOT_EVENTS: StreamEvent[] = [
  {
    id: 1,
    channel: "clipsflow.media_ready",
    time: "06:44:02s",
    payload: '{"media_id": "987", "url": "s3://video.mp4"}',
    tone: "cyan",
  },
  {
    id: 2,
    channel: "stix.synthesis_complete",
    time: "06:44:05s",
    payload:
      '{"status": "ghost_triad_generated", "prompt": "hyper-aesthetic"}',
    tone: "pink",
  },
  {
    id: 3,
    channel: "pupbot.snag_verified",
    time: "06:44:11s",
    payload: '{"state": "indexed", "hash": "0x9f4a"}',
    tone: "cyan",
  },
  {
    id: 4,
    channel: "clipsflow.asset_staged",
    time: "06:44:15s",
    payload: '{"cdn_zone": "void-4", "frames": 128}',
    tone: "pink",
  },
];

export function ControlPlaneDashboard() {
  const [events] = React.useState<StreamEvent[]>(BOOT_EVENTS);
  const [activeNode, setActiveNode] = React.useState("Clipsflow");

  return (
    <div className="min-h-screen bg-[#09040f] text-[#e9d7ff] selection:bg-[#ff5fd7]/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(140,232,255,0.12)_0%,_transparent_42%),radial-gradient(circle_at_bottom,_rgba(255,95,215,0.16)_0%,_transparent_45%)]" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-white/5 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-[1800px] items-center justify-between px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#8ce8ff]">Control Plane</p>
            <h1 className="text-xl font-semibold tracking-[0.25em] text-[#e9d7ff]">
              NEBULOSA // COMMAND
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-200/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-emerald-200 shadow-[0_0_25px_rgba(74,222,128,0.45)]">
              <span className="relative inline-flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-200" />
              </span>
              Telemetry: Online
            </div>

            <div className="rounded-xl border border-[#8ce8ff]/40 bg-[#10111c]/65 px-4 py-2 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#8ce8ff]">Ghost Requests Processed</p>
              <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-[#e9d7ff]">
                <Activity className="h-4 w-4 text-[#ff5fd7]" />
                14,208
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1800px] grid-cols-[300px_minmax(720px,1fr)_320px] gap-6 px-8 py-6">
        <aside className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8ce8ff]">
            <MixerHorizontalIcon />
            Bot Nodes
          </div>

          <div className="space-y-3">
            {NODE_LIST.map((node) => {
              const Icon = node.icon;
              const isActive = activeNode === node.name;

              return (
                <button
                  key={node.name}
                  type="button"
                  onClick={() => setActiveNode(node.name)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-all duration-300 ease-out ${
                    isActive
                      ? "border-[#8ce8ff]/80 bg-[#8ce8ff]/10 shadow-[0_0_20px_rgba(140,232,255,0.35)]"
                      : "border-white/10 bg-white/5 hover:border-[#8ce8ff]/70 hover:bg-[#8ce8ff]/10 hover:shadow-[0_0_24px_rgba(140,232,255,0.28)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-[#8ce8ff]" />
                    <div>
                      <p className="text-sm font-medium">{node.name}</p>
                      <p className="text-xs uppercase tracking-widest text-[#e9d7ff]/65">{node.role}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#ff5fd7]">Redis PubSub</p>
              <h2 className="text-lg font-semibold tracking-wide">Main Matrix // Stream Timeline</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#ff5fd7]/30 bg-[#ff5fd7]/10 px-3 py-1 text-xs uppercase tracking-widest text-[#ffb4ed]">
              <Radio className="h-3.5 w-3.5" />
              Live Feed
            </div>
          </div>

          <div className="max-h-[76vh] space-y-3 overflow-y-auto pr-2">
            {events.map((event) => {
              const isCyan = event.tone === "cyan";
              return (
                <article
                  key={event.id}
                  className="rounded-xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/25"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DotFilledIcon className={isCyan ? "text-[#8ce8ff]" : "text-[#ff5fd7]"} />
                      <p className={`text-sm font-semibold ${isCyan ? "text-[#8ce8ff]" : "text-[#ff5fd7]"}`}>
                        {event.channel}
                      </p>
                    </div>
                    <p className="text-xs uppercase tracking-widest text-[#e9d7ff]/60">{event.time}</p>
                  </div>

                  <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-[#e9d7ff]/90">
                    <code>{event.payload}</code>
                  </pre>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#ff5fd7]">
            <LightningBoltIcon />
            Quick Actions
          </div>

          <div className="space-y-3">
            <button
              type="button"
              className="group flex w-full items-center justify-between rounded-xl border border-[#ff5fd7]/50 bg-[#2a122a]/70 px-4 py-3 text-sm font-semibold text-[#ffd2f4] transition-all duration-300 ease-out hover:border-[#ff5fd7] hover:shadow-[0_0_22px_rgba(255,95,215,0.45)]"
            >
              Halt All Generation
              <ShieldAlert className="h-4 w-4 text-[#ff5fd7] transition-transform duration-300 ease-out group-hover:scale-110" />
            </button>

            <button
              type="button"
              className="group flex w-full items-center justify-between rounded-xl border border-[#8ce8ff]/45 bg-[#102228]/70 px-4 py-3 text-sm font-semibold text-[#c9f5ff] transition-all duration-300 ease-out hover:border-[#8ce8ff] hover:shadow-[0_0_22px_rgba(140,232,255,0.4)]"
            >
              Purge Redis Cache
              <Trash2 className="h-4 w-4 text-[#8ce8ff] transition-transform duration-300 ease-out group-hover:scale-110" />
            </button>

            <button
              type="button"
              className="group flex w-full items-center justify-between rounded-xl border border-[#ff5fd7]/50 bg-[#241035]/70 px-4 py-3 text-sm font-semibold text-[#ffd2f4] transition-all duration-300 ease-out hover:border-[#ff5fd7] hover:shadow-[0_0_22px_rgba(255,95,215,0.45)]"
            >
              Rotate Doppler Tokens
              <KeyRound className="h-4 w-4 text-[#ff5fd7] transition-transform duration-300 ease-out group-hover:scale-110" />
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3 text-xs text-[#e9d7ff]/75">
            <p className="flex items-center gap-2">
              <Flame className="h-3.5 w-3.5 text-[#ff5fd7]" />
              Active focus node: <span className="font-medium text-[#e9d7ff]">{activeNode}</span>
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default ControlPlaneDashboard;
