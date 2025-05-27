"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NewWebsitePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 0px 8px rgba(0,0,0,0.3)",
      transition: {
        duration: 0.3,
        yoyo: Infinity,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900 flex flex-col items-center justify-center p-4 sm:p-8">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 50, delay: 0.5 }}
        className="w-full max-w-6xl text-center mb-12"
      >
        <h1 className="text-5xl sm:text-6xl font-extrabold text-indigo-800 leading-tight">
          Welcome to Our Unique Digital Experience
        </h1>
        <p className="mt-4 text-xl text-indigo-600">
          Crafting innovative solutions with passion and precision.
        </p>
      </motion.header>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-8 sm:p-12 space-y-10"
      >
        <motion.section variants={itemVariants} className="text-center">
          <h2 className="text-4xl font-bold text-indigo-700 mb-4">
            Innovate. Create. Inspire.
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            We are a team of dedicated professionals committed to delivering exceptional digital products. Our approach combines cutting-edge technology with creative design to bring your visions to life. Explore our services and see how we can transform your ideas into reality.
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
          <div className="bg-blue-50 p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-indigo-600 mb-3">Web Development</h3>
            <p className="text-gray-700">Building responsive, high-performance websites tailored to your needs.</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-indigo-600 mb-3">UI/UX Design</h3>
            <p className="text-gray-700">Creating intuitive and engaging user experiences that delight your audience.</p>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="text-center">
          <h2 className="text-3xl font-bold text-indigo-700 mb-6">Ready to Start Your Project?</h2>
          <motion.div
            className="inline-block"
            variants={buttonVariants}
            whileHover="hover"
          >
            <Link href="#" className="bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:bg-indigo-700 transition-colors duration-300">
              Get in Touch
            </Link>
          </motion.div>
        </motion.section>
      </motion.main>

      <motion.footer
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 50, delay: 1.5 }}
        className="mt-12 text-center text-gray-600 text-sm"
      >
        &copy; {new Date().getFullYear()} Our Unique Digital Experience. All rights reserved.
      </motion.footer>
    </div>
  );
}
