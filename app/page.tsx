import React from "react";

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-6 space-y-8 shadow-xl z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-gray-900 font-bold text-lg">D</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Digital Garden</h1>
        </div>

        <nav className="flex flex-col space-y-2 flex-1">
          <button className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gray-800 text-white shadow-sm transition-all hover:bg-gray-700 hover:shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-4.5m-1.5 4.5a6.01 6.01 0 0 1-1.5-4.5m0 0A6.01 6.01 0 0 1 12 2.75a6.01 6.01 0 0 1 1.5 4.5m0 0v-4.5m0 0h.008v.008h-.008v-.008Zm0 0h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0 0h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0 0h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0 0h.008v.008h-.008v-.008Z"
              />
            </svg>
            <span className="font-medium">我的想法</span>
          </button>
          <button className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
              />
            </svg>
            <span className="font-medium">知识图谱</span>
          </button>
        </nav>

        <div className="pt-6 border-t border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
            <div className="text-sm text-gray-400">User Profile</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Display Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
          <div className="w-full max-w-5xl h-full border border-gray-200 bg-white rounded-3xl shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="text-center z-10 p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-500">
                这里将显示你的知识图谱
              </h2>
              <p className="text-gray-400 mt-2 text-sm">
                Start by adding your first idea below
              </p>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white/80 backdrop-blur-md border-t border-gray-100">
          <div className="max-w-3xl mx-auto relative">
            <div className="relative group">
              <input
                type="text"
                placeholder="输入你的想法..."
                className="w-full pl-6 pr-16 py-4 bg-gray-50 border border-gray-200 focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 rounded-2xl shadow-sm text-lg placeholder-gray-400 transition-all outline-none"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gray-900 text-white rounded-xl hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </button>
            </div>
            <div className="text-center mt-3">
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                MVP v0.1
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
