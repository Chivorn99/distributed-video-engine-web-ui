"use client";

import { useState, useEffect } from "react";
import { UploadCloud, FileVideo, CheckCircle, Loader2, PlayCircle, RefreshCw, Settings } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Dashboard & Player State
  const [uniqueVideoIds, setUniqueVideoIds] = useState<string[]>([]);
  const [currentPlayId, setCurrentPlayId] = useState("");
  const [quality, setQuality] = useState("720p"); // Default quality
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);

  const bucketUrl = "https://video-engine-standard.sgp1.digitaloceanspaces.com/processed_videos";
  
  // Dynamically generate the URL based on the selected quality and video ID
  const currentVideoUrl = currentPlayId ? `${bucketUrl}/${quality}_${currentPlayId}` : "";

  const fetchVideos = async () => {
    setIsLoadingVideos(true);
    try {
      // ⚠️ DROPLET 1 IP HERE ⚠️
      const res = await fetch("http://152.42.231.235:8080/videos");
      const data = await res.json();
      
      if (data) {
        // This magic strips "720p_" to find the true unique Video ID, and removes duplicates!
        const ids = Array.from(new Set(data.map((key: string) => {
          const fileName = key.replace("processed_videos/", ""); // e.g., "720p_vid-123.mp4"
          return fileName.substring(fileName.indexOf('_') + 1);  // e.g., "vid-123.mp4"
        })));
        
        setUniqueVideoIds(ids as string[]);
        if (ids.length > 0 && !currentPlayId) setCurrentPlayId(ids[0] as string);
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setIsSuccess(false);

    const formData = new FormData();
    formData.append("video", file);

    try {
      // ⚠️ DROPLET 1 IP HERE ⚠️
      const response = await fetch("http://152.42.231.235:8080/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setIsSuccess(true);
        setFile(null);
      }
    } catch (error) {
      alert("Network error. Make sure Go is running on port 8080!");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 p-6 md:p-12 font-sans">
      
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Distributed
          </span>{" "}
          Video Engine
        </h1>
        <p className="text-neutral-400">High-performance transcoding pipeline</p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-black rounded-xl overflow-hidden shadow-2xl border border-neutral-800">
            {currentPlayId ? (
              <video
                key={currentVideoUrl} // Forces React to reload the video when quality changes
                controls
                autoPlay
                className="w-full aspect-video bg-neutral-900"
              >
                <source src={currentVideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full aspect-video bg-neutral-900 flex items-center justify-center text-neutral-500">
                Select a video from the dashboard to play
              </div>
            )}
          </div>

          {/* Quality Switcher UI */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex items-center justify-between shadow-xl">
            <div>
              <h2 className="text-xl font-bold text-white">Playback Settings</h2>
              <p className="text-sm text-neutral-400">ID: {currentPlayId || "None selected"}</p>
            </div>
            
            <div className="flex items-center space-x-3 bg-neutral-800 py-2 px-4 rounded-lg border border-neutral-700">
              <Settings className="w-5 h-5 text-neutral-400" />
              <select 
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                disabled={!currentPlayId}
              >
                <option value="1080p">1080p HD</option>
                <option value="720p">720p HD</option>
                <option value="360p">360p SD</option>
              </select>
            </div>
          </div>

          {/* Uploader */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-white flex items-center">
              <UploadCloud className="w-5 h-5 mr-2 text-blue-400" />
              Upload New Video
            </h3>
            
            <div className="flex flex-col md:flex-row gap-4">
              <label className="flex-1 flex flex-col items-center justify-center border-2 border-neutral-700 border-dashed rounded-xl cursor-pointer bg-neutral-900/50 hover:bg-neutral-800/50 transition-all p-4 group">
                <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
                <p className="text-sm text-neutral-400 group-hover:text-blue-400">
                  {file ? file.name : "Click to select a video file"}
                </p>
              </label>

              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="md:w-48 flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-lg font-medium transition-colors"
              >
                {isUploading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /></> : "Upload File"}
              </button>
            </div>
            {isSuccess && <p className="mt-3 text-emerald-400 text-sm flex items-center"><CheckCircle className="w-4 h-4 mr-2"/> Sent to pipeline successfully!</p>}
          </div>
        </div>

        {/* RIGHT COLUMN: The Dashboard */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl h-[780px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Dashboard</h3>
            <button onClick={fetchVideos} className="text-neutral-400 hover:text-white transition-colors">
              <RefreshCw className={`w-5 h-5 ${isLoadingVideos ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {uniqueVideoIds.length === 0 && !isLoadingVideos && (
              <p className="text-neutral-500 text-center mt-10">No processed videos found.</p>
            )}
            
            {uniqueVideoIds.map((id) => {
              const isPlaying = currentPlayId === id;

              return (
                <div 
                  key={id}
                  onClick={() => setCurrentPlayId(id)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all flex items-center group ${
                    isPlaying 
                      ? "bg-blue-900/20 border-blue-500/50" 
                      : "bg-neutral-800/50 border-neutral-700 hover:bg-neutral-800"
                  }`}
                >
                  <PlayCircle className={`w-8 h-8 mr-3 flex-shrink-0 ${isPlaying ? "text-blue-400" : "text-neutral-500 group-hover:text-neutral-300"}`} />
                  <div className="overflow-hidden">
                    <p className={`text-sm font-medium truncate ${isPlaying ? "text-white" : "text-neutral-300"}`}>
                      {id}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">Multi-Quality Ready</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </main>
  );
}
