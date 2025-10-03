'use client';

import { ArrowRight, Check, Github, Terminal } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [copiedCommand, setCopiedCommand] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText(
      'git clone https://github.com/RadidDesfandri/template-react-express.git my project'
    );
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIxMjEyMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div className="text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2">
              <Terminal className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-300">
                Production-Ready Template
              </span>
            </div>

            <h1 className="mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-5xl font-bold text-transparent sm:text-7xl">
              Full-Stack Monorepo
            </h1>

            <p className="mb-4 text-xl text-slate-300 sm:text-2xl">
              Next.js + Express + Prisma
            </p>

            <p className="mx-auto mb-12 max-w-2xl text-lg text-slate-400">
              Template monorepo modern dengan type safety penuh, arsitektur
              terorganisir, dan development experience yang optimal
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={copyCommand}
                className="group relative cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 hover:from-blue-500 hover:to-purple-500 hover:shadow-xl hover:shadow-blue-500/40"
              >
                <span className="flex items-center gap-2">
                  {copiedCommand ? (
                    <>
                      <Check className="h-5 w-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      Get Started
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </button>

              <Link
                href="https://github.com/RadidDesfandri/template-react-express.git"
                target="_blank"
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-8 py-4 font-semibold transition-all duration-200 hover:border-slate-600 hover:bg-slate-800/50"
              >
                <Github className="h-5 w-5" />
                View on GitHub
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
