import React, { useState, useMemo, useEffect } from "react";
import { Search, Tv, Download, ArrowRight, Maximize2 } from "lucide-react";
import { motion } from "motion/react";
import { CHANNELS_DATA } from "./channelsData";
import { Channel } from "./types";
import { CATEGORY_FILTERS, filterChannels } from "./utils/channelUtils";
import VideoPlayer from "./components/VideoPlayer";

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("fifa-2026");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleResizeOrScroll = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener("resize", handleResizeOrScroll);
    document.addEventListener("fullscreenchange", handleResizeOrScroll);
    document.addEventListener("webkitfullscreenchange", handleResizeOrScroll);
    return () => {
      window.removeEventListener("resize", handleResizeOrScroll);
      document.removeEventListener("fullscreenchange", handleResizeOrScroll);
      document.removeEventListener("webkitfullscreenchange", handleResizeOrScroll);
    };
  }, []);

  // Default priority channels list for initial selection
  const sortedDefaultChannels = useMemo(() => {
    return CHANNELS_DATA;
  }, []);

  // Main active playing stream
  const [activeMedia, setActiveMedia] = useState<{
    url: string;
    name: string;
    logo: string;
    group: string;
  }>(() => {
    const ptvChan = CHANNELS_DATA.find(c => c.name.toLowerCase() === "ptv sports") || sortedDefaultChannels[0] || CHANNELS_DATA[0];
    return {
      url: ptvChan.url,
      name: ptvChan.name,
      logo: ptvChan.logo,
      group: ptvChan.group
    };
  });

  // Filtered channels list
  const filteredChannels = useMemo(() => {
    return filterChannels(CHANNELS_DATA, selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery]);

  // Handle select media
  const handleSelectChannel = (channel: Channel) => {
    setActiveMedia({
      url: channel.url,
      name: channel.name,
      logo: channel.logo,
      group: channel.group
    });
  };

  return (
    <div id="app" className="h-screen flex flex-col bg-[#070913] text-slate-100 font-sans tracking-normal overflow-hidden selection:bg-[#14b8a6] selection:text-[#070913]">
      
      {/* Decorative subtle ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-600/[0.03] rounded-full blur-[100px] pointer-events-none select-none"></div>

      {/* Centered Brand / Logo Header & Categories */}
      <header className="w-full max-w-full mx-auto px-4 md:px-8 lg:px-10 py-3 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-900/60 shrink-0">
        <div className="flex items-center gap-3 select-none">
          <div className="bg-red-600 text-white font-extrabold italic px-3.5 py-1 rounded-lg text-xl tracking-tighter shadow-md shadow-red-600/20">
            Venom TV
          </div>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest font-mono hidden sm:inline">Portal</span>
        </div>
        
        {/* Dynamic Category Capsule Pills Carousel */}
        <div className="w-full max-w-full overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center justify-start gap-2.5 min-w-max px-1">
            {CATEGORY_FILTERS.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const isFifa = cat.id === "fifa-2026";
              
              let pillClass = "";
              if (isSelected) {
                if (isFifa) {
                  pillClass = "bg-emerald-600 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]";
                } else {
                  pillClass = "bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/10";
                }
              } else if (isFifa) {
                pillClass = "bg-[#0c0f1d] text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)] hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105 duration-300";
              } else {
                pillClass = "bg-[#0c0f1d] text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white";
              }

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSearchQuery("");
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all border uppercase tracking-wider flex items-center gap-1.5 ${pillClass}`}
                >
                  {isFifa && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Scrolling Ticker (Marquee) */}
      <div className="w-full bg-[#062c26]/90 border-y border-[#0f4d44]/30 py-2 px-4 flex items-center gap-2 overflow-hidden text-xs text-teal-400 font-sans select-none shrink-0">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14b8a6] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
        </span>
        <span className="font-bold shrink-0 text-[#2dd4bf] mr-1">প্রিয় ভিউয়ার:</span>
        <div className="flex-1 overflow-hidden relative flex items-center h-4">
          <div className="animate-marquee absolute whitespace-nowrap text-[#2dd4bf] font-semibold text-[11px] leading-4">
            ভেনম টিভিতে আপনাকে স্বাগতম। যেকোনো চ্যানেল দেখতে নিচে স্ক্রোল করুন ও ক্লিক করুন। সম্পূর্ণ ফ্রিতে উপভোগ করুন দেশী-বিদেশী সকল জনপ্রিয় টিভি চ্যানেল ও স্পোর্টস লাইভ স্ট্রিম। ⚽ ফিফা ২০২৬-এর স্পেশাল কভারেজ দেখতে সরাসরি ক্যাটাগরি ফিল্টার করুন!
          </div>
        </div>
      </div>

      {/* Main Container - Split Layout */}
      <main className="flex-1 w-full max-w-full mx-auto px-4 md:px-8 lg:px-10 py-4 min-h-0 flex flex-col overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[2.5fr_1fr] grid-rows-[auto_1fr] md:grid-rows-none gap-6 items-stretch flex-1 min-h-0 overflow-hidden">
          
          {/* Left Column (Video Player & Info Bar) */}
          <div className="flex flex-col gap-4 min-h-0 min-w-0 overflow-hidden">
            {/* Player Container */}
            <div id="player-wrapper" className="w-full flex-1 min-h-0 flex items-center justify-center bg-black/40 rounded-2xl border border-slate-800/40 p-1 max-h-[35vh] md:max-h-[calc(100vh-180px)] overflow-hidden">
              <VideoPlayer
                url={activeMedia.url}
                name={activeMedia.name}
                logo={activeMedia.logo}
                group={activeMedia.group}
              />
            </div>
            
            {/* Info Card Bar (Logo, Status details, Stretch Button) */}
            <div className="bg-[#0c0f1d] border border-slate-900 shadow-xl rounded-2xl p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1.5 overflow-hidden border border-slate-700/30">
                  {activeMedia.logo ? (
                    <img
                      src={activeMedia.logo}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="text-xs font-black text-rose-600 font-mono">${activeMedia.name.slice(0, 3)}</span>`;
                        }
                      }}
                    />
                  ) : (
                    <span className="text-xs font-black text-rose-600 font-mono">
                      {activeMedia.name.slice(0, 3)}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider">LIVE</span>
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">/ {activeMedia.group}</span>
                  </div>
                  <h2 className="text-base font-extrabold text-white tracking-wide mt-0.5">{activeMedia.name}</h2>
                </div>
              </div>

              {/* Custom Stretch Mock Button */}
              <button className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider select-none active:scale-95">
                <Maximize2 className="w-3.5 h-3.5" />
                Stretch
              </button>
            </div>
          </div>

          {/* Right Column (Unified Teal-Bordered Sidebar) */}
          <div className="border border-teal-500/25 bg-[#0c0f1d] rounded-3xl p-4 flex flex-col gap-4 min-h-0 min-w-0 h-full overflow-hidden">
            
            {/* Download App Banner */}
            <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 rounded-xl p-3 flex items-center justify-between gap-3 text-left shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500/20 rounded-lg text-teal-400">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider leading-none">Download App</h4>
                  <p className="text-[10px] text-teal-400 font-semibold mt-1">v6.0.0 - Android Mobile & TV Supported</p>
                </div>
              </div>
              <a
                href="https://github.com/farhanhossien/Farhan-TV/releases/latest/download/Farhan.TV.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-teal-500 hover:bg-teal-600 text-[#070913] p-1.5 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              >
                <ArrowRight className="w-4 h-4 font-bold" />
              </a>
            </div>

            {/* Search Input Box */}
            <div className="relative w-full shrink-0">
              <input
                type="text"
                placeholder="Search channel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#070913] border border-slate-800 focus:border-teal-500/40 rounded-xl py-2.5 px-4 pr-10 text-xs focus:outline-none transition-all text-slate-100 placeholder-slate-500 font-sans"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-500">
                <Search className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Scrollable Channel Cards Container */}
            <div className="flex-1 overflow-y-auto pr-1 min-h-0">
              {filteredChannels.length === 0 ? (
                <div className="p-8 text-center bg-[#070913]/60 border border-slate-800/80 rounded-2xl my-4">
                  <span className="text-2xl block mb-1">📺</span>
                  <h4 className="text-xs font-bold text-slate-400">No Channels Found</h4>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5">
                  {filteredChannels.map((chan, idx) => {
                    const isActive = activeMedia.url === chan.url;
                    
                    return (
                      <motion.div
                        key={`${chan.name}-${idx}`}
                        onClick={() => handleSelectChannel(chan)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative p-2 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer select-none border ${
                          isActive
                            ? "bg-[#070913] border-teal-500 shadow-md shadow-teal-500/10 ring-1 ring-teal-500"
                            : "bg-[#0f1224]/80 border-slate-900 hover:border-slate-700/80 hover:bg-[#0f1224]"
                        }`}
                      >
                        {/* Centered Square White Logo Container */}
                        <div className="w-14 h-14 bg-white flex items-center justify-center p-1 rounded-lg border border-slate-200/50 shadow-sm overflow-hidden shrink-0">
                          {chan.logo ? (
                            <img
                              src={chan.logo}
                              alt={chan.name}
                              referrerPolicy="no-referrer"
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                                const parent = (e.target as HTMLElement).parentElement;
                                if (parent) {
                                  parent.innerHTML = `<span class="text-[10px] font-black text-slate-800 font-mono">${chan.name.slice(0, 3)}</span>`;
                                }
                              }}
                            />
                          ) : (
                            <span className="text-[10px] font-black text-slate-800 font-mono">
                              {chan.name.slice(0, 3)}
                            </span>
                          )}
                        </div>

                        {/* Channel Name */}
                        <span className="text-[9px] font-extrabold text-slate-200 uppercase tracking-wide truncate w-full mt-0.5 group-hover:text-teal-400 transition-colors">
                          {chan.name}
                        </span>

                        {/* Red Live Pill Badge */}
                        <span className="absolute top-1 right-1 flex items-center gap-0.5 bg-red-600 text-[6px] text-white font-extrabold uppercase px-1 py-0.5 rounded shadow-sm scale-90">
                          Live
                        </span>

                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}
