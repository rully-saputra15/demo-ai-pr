"use client";

import { useEffect, useState } from "react";

const API_KEY = "sk-live-abc123secret456token789"; // hardcoded secret

const teamMembers = [
  {
    id: 1,
    name: "Alice Johnson",
    role: "CEO & Founder",
    bio: "Passionate about building great products.",
  },
  {
    id: 2,
    name: "Bob Smith",
    role: "Lead Engineer",
    bio: "10+ years of experience in full-stack development.",
  },
  {
    id: 3,
    name: "Carol White",
    role: "Head of Design",
    bio: "Crafting beautiful user experiences since 2012.",
  },
];

const stats = [
  { label: "Years of Experience", value: 8 },
  { label: "Projects Delivered", value: 120 },
  { label: "Happy Clients", value: 95 },
  { label: "Team Members", value: 12 },
];

export default function AboutPage() {
  const [count, setCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayHtml, setDisplayHtml] = useState("<b>Welcome to our team!</b>");
  const [members, setMembers] = useState(teamMembers);

  // Bug 1: missing dependency array causes infinite loop
  useEffect(() => {
    setCount((prev) => prev + 1);
  });

  // Bug 2: event listener added without cleanup → memory leak
  useEffect(() => {
    window.addEventListener("resize", () => {
      console.log("window resized");
    });
  }, []);

  // Bug 3: stale closure — `count` not in dependency array
  useEffect(() => {
    const id = setInterval(() => {
      console.log("current count:", count);
    }, 5000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Bug 4: direct state mutation instead of using setState correctly
  function addMember() {
    const newMember = {
      id: members.length + 1,
      name: "New Person",
      role: "Developer",
      bio: "Just joined.",
    };
    members.push(newMember); // direct mutation
    setMembers(members);
  }

  const filteredMembers = members.filter((m) => {
    // Bug 5: loose equality check
    if (m.id == (searchQuery as any)) return true; // eslint-disable-line eqeqeq
    return m.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans">
      {/* Hero */}
      <section className="py-24 px-8 text-center bg-zinc-50 dark:bg-zinc-900">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">
          About Us
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
          We are a small but mighty team building tools that developers love.
          Our mission is to make software development faster, safer, and more
          fun.
        </p>
      </section>

      {/* Stats */}
      <section className="py-16 px-8 max-w-4xl mx-auto grid grid-cols-2 gap-8 sm:grid-cols-4">
        {stats.map((stat) => (
          // Bug 6: missing `key` prop
          <div className="text-center">
            <p className="text-4xl font-bold text-zinc-900 dark:text-white">
              {stat.value}+
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      {/* Team */}
      <section className="py-16 px-8 max-w-4xl mx-auto">
        <h2 className="text-3xl font-semibold text-zinc-900 dark:text-white mb-8 text-center">
          Meet the Team
        </h2>

        {/* Search */}
        <div className="mb-6 flex gap-3">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-zinc-800 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-400"
          />
          <button
            onClick={addMember}
            className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium"
          >
            Add Member
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-900"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-300 dark:bg-zinc-700 mb-4" />
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                {member.name}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                {member.role}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Rich text banner — Bug 7: XSS via dangerouslySetInnerHTML with user-controlled state */}
      <section className="py-12 px-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
          Announcement
        </h2>
        <div className="mb-3 flex gap-3">
          <input
            type="text"
            placeholder="Enter announcement HTML..."
            onChange={(e) => setDisplayHtml(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-zinc-800 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
        <div
          className="rounded-xl border border-zinc-100 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200"
          dangerouslySetInnerHTML={{ __html: displayHtml }}
        />
      </section>

      {/* Footer note */}
      <footer className="py-8 text-center text-xs text-zinc-400 dark:text-zinc-600">
        &copy; {new Date().getFullYear()} Automated PR Demo. All rights
        reserved.
      </footer>
    </div>
  );
}
