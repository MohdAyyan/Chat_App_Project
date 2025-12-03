"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useParallax } from "@/hooks/useParallax";
import Image from "next/image";

export default function HeroSection() {
  const router = useRouter();
  const parallaxOffset = useParallax(0.3);
  const [glitchText, setGlitchText] = useState("Team Chat Revolution");

  const glitchTexts = [
    "Team Chat Revolution",
    "Teаm Chat Revolution",
    "Team Chat Revolutіon",
    "Team Chat Revоlution",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchText(
        glitchTexts[Math.floor(Math.random() * glitchTexts.length)]
      );
      setTimeout(() => {
        setGlitchText("Team Chat Revolution");
      }, 100);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    router.push("/login");
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 mt-32"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 animate-pulse">
              {glitchText}
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Experience the future of team collaboration. Real-time messaging,
            seamless channels, and powerful features that bring your team
            together.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <button
              onClick={handleGetStarted}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full font-bold text-white text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50"
              data-hoverable
            >
              <span className="relative z-10">Get Started Free</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                whileHover={{ scale: 1.1 }}
              />
            </button>

            <button
              onClick={() => {
                const element = document.querySelector("#features");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-4 backdrop-blur-lg bg-white/10 border border-white/20 rounded-full font-bold text-white text-lg transition-all duration-300 hover:bg-white/20 hover:scale-105"
              data-hoverable
            >
              Explore Features
            </button>
          </motion.div>
        </motion.div>

        {/* 3D Demo Preview */}
        <motion.div
          className="mt-20 relative max-w-5xl mx-auto"
          style={{
            transform: `translateY(${parallaxOffset * 0.5}px)`,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <div className="relative w-full">
            <div className="backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl p-4 shadow-2xl">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 p-4 border-b border-white/10">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="relative w-full h-[500px]">
                  <Image
                    src="/HeroImage.png"
                    alt="Live Chat Preview"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
