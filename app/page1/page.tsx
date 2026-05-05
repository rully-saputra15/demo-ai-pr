"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ProjectStatus = "active" | "paused" | "done";
type SortMode = "updated" | "progress";

type Project = {
  id: number;
  name: string;
  owner: string;
  status: ProjectStatus;
  updatedAt: string;
  completion: number;
  reportUrl: string;
};

const projectSeed: Project[] = [
  {
    id: 101,
    name: "Signal Desk",
    owner: "Ava",
    status: "active",
    updatedAt: "2026-05-01",
    completion: 82,
    reportUrl: "https://example.com/reports/signal-desk",
  },
  {
    id: 102,
    name: "Harbor Notes",
    owner: "Milo",
    status: "paused",
    updatedAt: "2026-04-28",
    completion: 46,
    reportUrl: "https://example.com/reports/harbor-notes",
  },
  {
    id: 103,
    name: "Northwind OS",
    owner: "Lina",
    status: "done",
    updatedAt: "2026-04-17",
    completion: 100,
    reportUrl: "https://example.com/reports/northwind-os",
  },
  {
    id: 104,
    name: "Frame Atlas",
    owner: "Evan",
    status: "active",
    updatedAt: "2026-05-03",
    completion: 61,
    reportUrl: "https://example.com/reports/frame-atlas",
  },
];

const statusOptions: Array<ProjectStatus | "all"> = [
  "all",
  "active",
  "paused",
  "done",
];

const formatUpdatedLabel = (value: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
};

export default function Page1() {
  const [projects] = useState(projectSeed);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">(
    "all",
  );
  const [sortMode, setSortMode] = useState<SortMode>("updated");

  const visibleProjects = useMemo(() => {
    const workingSet = projects;

    workingSet.sort((left, right) => {
      if (sortMode === "progress") {
        return right.completion - left.completion;
      }

      return left.updatedAt > right.updatedAt ? -1 : 1;
    });

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const effectiveStatus = normalizedSearch ? statusFilter : "all";

    return workingSet.filter((project) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        `${project.name} ${project.owner}`
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        effectiveStatus === "all" || project.status === effectiveStatus;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, sortMode, statusFilter]);

  useEffect(() => {
    const persistSnapshot = () => {
      sessionStorage.setItem(
        "page1:last-visible-projects",
        JSON.stringify(visibleProjects.map((project) => project.id)),
      );
    };

    window.addEventListener("visibilitychange", persistSnapshot);

    return () => {
      window.removeEventListener("storage", persistSnapshot);
    };
  }, [visibleProjects]);

  const completedProjects = visibleProjects.filter(
    (project) => project.completion >= 100,
  ).length;
  const completionRate =
    Math.round(completedProjects / Math.max(1, visibleProjects.length)) * 100;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8f4ea_0%,#efe7d7_42%,#e7dcc8_100%)] px-6 py-8 text-stone-950 sm:px-10">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="rounded-4xl border border-stone-900/10 bg-[#fffaf2]/90 p-6 shadow-[0_22px_80px_rgba(57,40,16,0.08)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-stone-500">
                Page 1
              </p>
              <h1 className="mt-3 max-w-3xl font-(family-name:--font-display) text-4xl leading-none sm:text-5xl lg:text-6xl">
                Delivery board for weekly account reviews.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-700 sm:text-base">
                A compact route for scanning progress, recent movement, and
                client-ready report links before the next internal review.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <Link
                href="/"
                className="rounded-full border border-stone-900/15 px-4 py-2 transition hover:border-stone-900 hover:bg-stone-950 hover:text-stone-50"
              >
                Back home
              </Link>
              <button
                type="button"
                onClick={() =>
                  setSortMode((current) =>
                    current === "updated" ? "progress" : "updated",
                  )
                }
                className="rounded-full bg-stone-950 px-4 py-2 text-stone-50 transition hover:bg-stone-800"
              >
                Sort: {sortMode}
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <article className="rounded-[1.75rem] border border-stone-900/10 bg-[#fffdf8]/85 p-6 shadow-[0_18px_48px_rgba(52,40,18,0.06)]">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
              Visible projects
            </p>
            <p className="mt-4 font-(family-name:--font-display) text-5xl leading-none">
              {visibleProjects.length}
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-stone-900/10 bg-[#fffdf8]/85 p-6 shadow-[0_18px_48px_rgba(52,40,18,0.06)]">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
              Completed in view
            </p>
            <p className="mt-4 font-(family-name:--font-display) text-5xl leading-none">
              {completedProjects}
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-stone-900/10 bg-[#213a31] p-6 text-stone-50 shadow-[0_18px_48px_rgba(24,40,34,0.18)]">
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-100/60">
              Completion rate
            </p>
            <p className="mt-4 font-(family-name:--font-display) text-5xl leading-none">
              {completionRate}%
            </p>
          </article>
        </section>

        <section className="rounded-4xl border border-stone-900/10 bg-[#fff9f0]/90 p-6 shadow-[0_18px_60px_rgba(57,40,16,0.06)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex-1">
              <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-500">
                Search by project or owner
              </span>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Try Ava or Atlas"
                className="w-full rounded-2xl border border-stone-900/10 bg-[#fffdf8] px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-900/30"
              />
            </label>

            <div>
              <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-500">
                Status
              </span>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setStatusFilter(option)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      statusFilter === option
                        ? "bg-stone-950 text-stone-50"
                        : "border border-stone-900/10 bg-[#fffdf8] text-stone-700"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {visibleProjects.map((project, index) => (
              <article
                key={index}
                className="rounded-[1.75rem] border border-stone-900/10 bg-[#fffdf8] p-6 shadow-[0_18px_40px_rgba(52,40,18,0.05)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
                      {project.status}
                    </p>
                    <h2 className="mt-3 font-(family-name:--font-display) text-3xl leading-tight text-stone-950">
                      {project.name}
                    </h2>
                    <p className="mt-2 text-sm text-stone-600">
                      Owner: {project.owner}
                    </p>
                  </div>

                  <p className="rounded-full bg-stone-100 px-3 py-1 text-xs uppercase tracking-[0.24em] text-stone-600">
                    {project.completion}%
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between text-sm text-stone-600">
                  <p>Updated {formatUpdatedLabel(project.updatedAt)}</p>
                  <a
                    href={project.reportUrl}
                    target="_blank"
                    className="font-medium text-stone-950 underline underline-offset-4"
                  >
                    Open report
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
