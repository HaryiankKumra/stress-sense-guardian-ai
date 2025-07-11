import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ContactForm from "@/components/ContactForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  Heart,
  Activity,
  Zap,
  Users,
  ChevronRight,
  Download,
  ExternalLink,
  Mail,
  Linkedin,
  MapPin,
  Phone,
  Monitor,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

const IntroductionPage = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const teamMembers = [
    {
      name: "Arjun Sharma",
      role: "ML Engineer",
      email: "arjun@stressguard.ai",
      linkedin: "https://linkedin.com/in/arjun-sharma",
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Priya Patel",
      role: "ML Engineer",
      email: "priya@stressguard.ai",
      linkedin: "https://linkedin.com/in/priya-patel",
      photo:
        "https://images.unsplash.com/photo-1494790108755-2616b332166c?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Rahul Singh",
      role: "ML Engineer",
      email: "rahul@stressguard.ai",
      linkedin: "https://linkedin.com/in/rahul-singh",
      photo:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Sneha Gupta",
      role: "ML Engineer",
      email: "sneha@stressguard.ai",
      linkedin: "https://linkedin.com/in/sneha-gupta",
      photo:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Vikram Kumar",
      role: "Frontend Engineer",
      email: "vikram@stressguard.ai",
      linkedin: "https://linkedin.com/in/vikram-kumar",
      photo:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Anisha Verma",
      role: "Backend Engineer",
      email: "anisha@stressguard.ai",
      linkedin: "https://linkedin.com/in/anisha-verma",
      photo:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Karan Joshi",
      role: "Hardware Engineer",
      email: "karan@stressguard.ai",
      linkedin: "https://linkedin.com/in/karan-joshi",
      photo:
        "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-50 dark:from-slate-900 dark:via-sky-900 dark:to-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Monitor className="w-8 h-8 text-sky-600 dark:text-sky-400" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              StressGuard AI
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#about"
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              About
            </a>
            <a
              href="#team"
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Team
            </a>
            <a
              href="#research"
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Research
            </a>
            <a
              href="#technology"
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Technology
            </a>
            <a
              href="#contact"
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Contact
            </a>
            <ThemeToggle />
            <Link
              to="/login"
              className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div
            className="space-y-6"
            style={{
              transform: `translateY(${scrollY * 0.1}px)`,
              opacity: Math.max(0.3, 1 - scrollY * 0.001),
            }}
          >
            <h1 className="text-6xl font-bold text-slate-900 dark:text-white leading-tight">
              Your{" "}
              <span className="text-sky-600 dark:text-sky-400">stress</span>
              <br />
              <span className="text-cyan-600 dark:text-cyan-400">speaks</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              AI-powered biometric and facial recognition technology
              <br />
              to detect and manage stress in real-time
            </p>
            <div className="flex items-center gap-4">
              <a href="#about">
                <Button className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3">
                  What we do
                </Button>
              </a>
              <a href="#technology">
                <Button
                  variant="outline"
                  className="border-sky-300 dark:border-slate-600 text-sky-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 px-6 py-3"
                >
                  How it works
                </Button>
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="w-96 h-96 mx-auto relative bg-gradient-to-br from-sky-50/50 to-cyan-50/50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl border border-sky-200 dark:border-slate-600 overflow-hidden backdrop-blur-sm">
              {/* Pulse Animation */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                <div className="w-full mb-8 flex justify-center">
                  <div className="cWrapper">
                    <canvas className="cLine cLine1"></canvas>
                    <canvas className="cLine cLine2"></canvas>
                    <canvas className="cLine cLine3"></canvas>
                    <canvas className="cLine cLine4"></canvas>
                  </div>
                </div>

                <div className="text-center">
                  <Activity className="w-12 h-12 text-sky-600 dark:text-sky-400 mx-auto mb-3" />
                  <p className="text-sky-600 dark:text-sky-400 font-semibold text-lg">
                    Real-time Monitoring
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    AI-Powered Detection
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section
        id="about"
        className="bg-white/30 dark:bg-slate-800/30 py-20 transition-colors duration-300"
      >
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="w-80 h-80 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-sky-500/20 rounded-lg transform rotate-6"></div>
                <div className="absolute inset-4 bg-white/50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center">
                  <Heart className="w-32 h-32 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <Badge className="bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30">
                OUR MISSION
              </Badge>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                Unlock biometrics and{" "}
                <span className="text-cyan-600 dark:text-cyan-400">
                  facial recognition
                </span>{" "}
                as vital signs for stress prediction
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-lg">+</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  We are developing an AI-powered biometric and facial
                  recognition platform that transforms stress monitoring through
                  real-time physiological and emotional analysis
                </p>
              </div>
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 cursor-pointer hover:text-sky-700 dark:hover:text-sky-300 transition-colors">
                <span>Learn more about our research</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Papers Section */}
      <section id="research" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30 mb-4">
              Our Research
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Published Research & Technical Reports
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Our work is backed by rigorous research and has been published in
              peer-reviewed journals and conferences
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Research Paper 1 */}
            <Card className="bg-white/50 dark:bg-slate-800/50 border-sky-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-sky-600/20 rounded-lg flex items-center justify-center mb-4">
                  <ExternalLink className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                  Real-time Stress Detection using WESAD Dataset
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                  A comprehensive study on multimodal stress detection using
                  physiological signals and machine learning approaches.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-sky-600 dark:text-sky-400 border-sky-300 dark:border-sky-600"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Read Paper
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Research Paper 2 */}
            <Card className="bg-white/50 dark:bg-slate-800/50 border-sky-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                  Facial Expression Analysis for Stress Recognition
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                  Novel approaches to detect stress through facial
                  micro-expressions using computer vision and deep learning.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-cyan-600 dark:text-cyan-400 border-cyan-300 dark:border-cyan-600"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Read Paper
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Technical Report */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:shadow-lg transition-all duration-300 text-white">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold mb-3">
                  Technical Implementation Report
                </h3>
                <p className="text-slate-300 text-sm mb-4">
                  Comprehensive technical documentation of our stress detection
                  system architecture and implementation details.
                </p>
                <Button
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Detection Capabilities */}
      <section className="bg-white/30 dark:bg-slate-800/30 py-20 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30 mb-4">
              We can detect
            </Badge>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                Acute Stress
              </h2>
              <h2 className="text-4xl font-bold text-slate-500 dark:text-slate-400">
                Facial Expressions
              </h2>
              <h2 className="text-4xl font-bold text-slate-500 dark:text-slate-400">
                Chronic Fatigue
              </h2>
              <h2 className="text-4xl font-bold text-slate-500 dark:text-slate-400">
                Anxiety Levels
              </h2>
              <h2 className="text-4xl font-bold text-slate-500 dark:text-slate-400">
                Heart Rate Variability
              </h2>
              <h2 className="text-4xl font-bold text-slate-500 dark:text-slate-400">
                Emotional State
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30 mb-4">
              Steeped in research
            </Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/50 dark:bg-slate-800/50 border-sky-200 dark:border-slate-700 hover:border-sky-500/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-sky-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-sky-600 dark:text-sky-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Real-time Analysis
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Continuous monitoring and analysis of biometric and facial
                  data with instant stress detection
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/50 dark:bg-slate-800/50 border-sky-200 dark:border-slate-700 hover:border-cyan-500/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-cyan-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  AI-Powered Detection
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Advanced machine learning models trained on physiological and
                  facial expression datasets
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/50 dark:bg-slate-800/50 border-sky-200 dark:border-slate-700 hover:border-blue-500/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Multi-sensor Integration
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Combining GSR, heart rate, temperature, and facial expression
                  analysis
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Hardware & Technology */}
      <section className="bg-white/30 dark:bg-slate-800/30 py-20 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30 mb-4">
              Hardware & Technology
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Cutting-edge sensor and camera integration
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="bg-white/50 dark:bg-slate-800/50 border-sky-200 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-sky-600 dark:text-sky-400 font-mono text-sm mb-2">
                  ESP32
                </div>
                <h4 className="text-slate-900 dark:text-white font-semibold mb-2">
                  Microcontroller
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Wi-Fi enabled processing unit
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/50 dark:bg-slate-800/50 border-sky-200 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-cyan-600 dark:text-cyan-400 font-mono text-sm mb-2">
                  GSR
                </div>
                <h4 className="text-slate-900 dark:text-white font-semibold mb-2">
                  Skin Conductance
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Galvanic skin response sensor
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/50 dark:bg-slate-800/50 border-sky-200 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-blue-600 dark:text-blue-400 font-mono text-sm mb-2">
                  PPG
                </div>
                <h4 className="text-slate-900 dark:text-white font-semibold mb-2">
                  Heart Rate
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Photoplethysmography sensor
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/50 dark:bg-slate-800/50 border-sky-200 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-teal-600 dark:text-teal-400 font-mono text-sm mb-2">
                  DS18B20
                </div>
                <h4 className="text-slate-900 dark:text-white font-semibold mb-2">
                  Temperature
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Digital temperature sensor
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/50 dark:bg-slate-800/50 border-sky-200 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-sky-600 dark:text-sky-300 font-mono text-sm mb-2">
                  CAMERA
                </div>
                <h4 className="text-slate-900 dark:text-white font-semibold mb-2">
                  Facial Recognition
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  AI-powered expression analysis
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Powered by advanced AI models trained on the WESAD dataset
            </p>
            <div className="flex justify-center gap-4">
              <Badge className="bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30">
                TensorFlow
              </Badge>
              <Badge className="bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30">
                Real-time Processing
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">
                97% Accuracy
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30 mb-4">
              Our Team
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Engineering Students from Thapar University
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Our multidisciplinary team of engineering students combines
              expertise in ML, software development, and hardware engineering.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="bg-white/50 dark:bg-slate-800/50 border-sky-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6 text-center">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {member.name}
                  </h3>
                  <p className="text-sky-600 dark:text-sky-400 text-sm mb-4">
                    {member.role}
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="p-2 border-sky-300 dark:border-sky-600"
                      onClick={() => window.open(`mailto:${member.email}`)}
                    >
                      <Mail className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="p-2 border-sky-300 dark:border-sky-600"
                      onClick={() => window.open(member.linkedin)}
                    >
                      <Linkedin className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900 py-20 transition-colors duration-300"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30 mb-4">
              Contact Us
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Let's Connect & Collaborate
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-3xl mx-auto text-lg">
              Ready to explore the future of stress detection? Join us in
              revolutionizing mental health technology. Get in touch with our
              innovative team at Thapar University.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Side - Contact Information & Form */}
            <div className="space-y-8">
              {/* Contact Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur border-sky-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                        Our Location
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                        Thapar Institute of Engineering & Technology
                        <br />
                        P.O. Box 32, Patiala
                        <br />
                        Punjab 147004, India
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur border-sky-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Phone className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                        Contact Info
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                        Phone: +91 175 239 3021
                        <br />
                        Email: contact@stressguard.ai
                        <br />
                        Support: 24/7 Available
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Links & Social */}
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur border-sky-200 dark:border-slate-700">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        Quick Contact
                      </h3>
                      <div className="space-y-3">
                        <a
                          href="mailto:contact@stressguard.ai"
                          className="block p-3 rounded-lg bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors"
                        >
                          <div className="text-sky-600 dark:text-sky-400 font-medium text-sm">
                            Research Collaboration
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-xs">
                            collaborate@stressguard.ai
                          </div>
                        </a>
                        <a
                          href="mailto:support@stressguard.ai"
                          className="block p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors"
                        >
                          <div className="text-cyan-600 dark:text-cyan-400 font-medium text-sm">
                            Technical Support
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-xs">
                            support@stressguard.ai
                          </div>
                        </a>
                        <a
                          href="mailto:partnerships@stressguard.ai"
                          className="block p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                        >
                          <div className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                            Business Partnerships
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-xs">
                            partnerships@stressguard.ai
                          </div>
                        </a>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                        Office Hours
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-300">
                            Monday - Friday
                          </span>
                          <span className="text-slate-900 dark:text-white font-medium">
                            9:00 AM - 6:00 PM
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-300">
                            Saturday
                          </span>
                          <span className="text-slate-900 dark:text-white font-medium">
                            10:00 AM - 4:00 PM
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-300">
                            Sunday
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            Closed
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-600">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                          Follow Our Research
                        </h4>
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-sky-300 dark:border-sky-600 text-sky-600 dark:text-sky-400"
                          >
                            LinkedIn
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-sky-300 dark:border-sky-600 text-sky-600 dark:text-sky-400"
                          >
                            GitHub
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Time Indicator */}
              <div className="text-center">
                <div className="inline-flex items-center gap-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur border border-sky-200 dark:border-slate-700 rounded-2xl px-6 py-4">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                    Average response time:{" "}
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      2-4 hours
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side - Map & Contact Form */}
            <div className="space-y-8">
              {/* Google Maps */}
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur border-sky-200 dark:border-slate-700 overflow-hidden">
                <CardHeader className="pb-0">
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    Find Us at Thapar University
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-80 bg-slate-200 dark:bg-slate-700">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3425.2056903246506!2d76.36047067432932!3d30.354260774770934!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391028fc3b7a2345%3A0x80c2e16f84b38ee8!2sThapar%20Institute%20of%20Engineering%20and%20Technology!5e0!3m2!1sen!2sin!4v1727878171022!5m2!1sen!2sin"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Thapar University Location"
                    ></iframe>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Form */}
              
                <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-sky-600/20 to-cyan-400/20 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
            Ready to monitor your stress?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            Experience the future of stress detection with our AI-powered
            biometric and facial recognition system
          </p>
          <Link to="/signup">
            <Button className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-4 text-lg">
              Get Started
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-900 py-12 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Monitor className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  StressGuard AI
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                © 2025 StressGuard AI. All rights reserved.
              </p>
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-semibold mb-3">
                Technology
              </h4>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div>AI & Machine Learning</div>
                <div>Biometric Sensors</div>
                <div>Real-time Processing</div>
                <div>Facial Recognition</div>
              </div>
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-semibold mb-3">
                Research
              </h4>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div>WESAD Dataset</div>
                <div>Clinical Validation</div>
                <div>Peer Review</div>
                <div>Technical Reports</div>
              </div>
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-semibold mb-3">
                Contact
              </h4>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div>Thapar University</div>
                <div>Research Team</div>
                <div>Technical Support</div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes heartbeat {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

export default IntroductionPage;