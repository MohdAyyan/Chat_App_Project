"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useScrollPosition } from "@/hooks/useScrollPosition";

export default function GlassNavigation() {
  const router = useRouter();
  const scrollPosition = useScrollPosition();
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setIsScrolled(scrollPosition > 50);
  }, [scrollPosition]);

  const navItems = [
    { id: "home", label: "Home", href: "#home", isLink: false },
    { id: "features", label: "Features", href: "#features", isLink: false },
    { id: "stats", label: "Stats", href: "#stats", isLink: false },
    { id: "login", label: "Login", href: "/login", isLink: true },
    { id: "cta", label: "Get Started", href: "/login", isLink: true },
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleGetStarted = () => {
    router.push("/login");
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-4 left-0 right-0 z-50 transition-all duration-300 flex justify-center"
    >
      <div
        className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-8 py-3 shadow-2xl transition-all duration-300 ${
          isScrolled ? "bg-white/15 shadow-blue-500/20" : ""
        }`}
      >
        <ul className="flex items-center justify-center space-x-8">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() =>
                  item.isLink
                    ? router.push(item.href)
                    : handleNavClick(item.href)
                }
                className={`relative text-sm font-medium transition-all duration-300 hover:text-blue-400 ${
                  activeSection === item.id ? "text-blue-400" : "text-white/80"
                }`}
                data-hoverable
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </motion.nav>
  );
}
