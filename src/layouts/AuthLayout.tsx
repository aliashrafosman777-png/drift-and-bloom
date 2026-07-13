// @ts-nocheck
"use client"

import React from "react";
import { motion } from "framer-motion";
import Logo from "../components/common/Logo";
import OptimizedImage from '../components/common/OptimizedImage'

export default function AuthLayout({ title, subtitle, children, image }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-cream">
      <motion.div
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12"
      >
        <div className="max-w-md w-full">
          <Logo />
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal mb-2 mt-8">
            {title}
          </h1>
          {subtitle && (
            <p className="text-charcoal/60 text-sm mb-8">{subtitle}</p>
          )}
          {children}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.48, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex items-center justify-center bg-cream p-10"
      >
        <div className="relative group">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-gold/20 to-sage/10 blur-2xl" />
          <OptimizedImage
            src={image}
            alt="Drift & Bloom"
            className="relative w-[85%] max-w-[700px] rounded-3xl shadow-2xl object-contain transition duration-700 group-hover:scale-[1.01]"
          />
        </div>
      </motion.div>
    </div>
  );
}
