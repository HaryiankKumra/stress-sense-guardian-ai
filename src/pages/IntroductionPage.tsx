import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
            <div className="w-96 h-96 mx-auto relative bg-slate-100/10 dark:bg-slate-800/10 rounded-2xl overflow-hidden">
              {/* Left-to-Right Pulse Animation */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent pulse-line"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Activity className="w-16 h-16 text-sky-600 dark:text-sky-400 mx-auto mb-4" />
                  <p className="text-sky-600 dark:text-sky-400 font-semibold">
                    Real-time Monitoring
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
        className="bg-white/30 dark:bg-slate-800/30 py-20 transition-colors duration-300"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30 mb-4">
              Contact Us
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Get in Touch
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Have questions about our research or want to collaborate? We'd
              love to hear from you.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-sky-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Address
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Thapar Institute of Engineering & Technology
                    <br />
                    P.O. Box 32, Patiala, Punjab 147004
                    <br />
                    India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Contact
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    +91 175 239 3021
                    <br />
                    contact@stressguard.ai
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3434.0842398571437!2d76.36230837432056!3d30.66651197464618!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390fefb8ab4e7be7%3A0x65b31c5f7dc3f2b8!2sThapar%20Institute%20of%20Engineering%20and%20Technology!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Thapar University Location"
                ></iframe>
              </div>

              {/* Contact Form */}
              <Card className="bg-white/50 dark:bg-slate-800/50 border-sky-200 dark:border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    Send us a Message
                  </h3>
                  <form className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-sky-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 border border-sky-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="Your email"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-sky-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="Message subject"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Message
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-3 py-2 border border-sky-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="Your message..."
                      ></textarea>
                    </div>
                    <Button className="bg-sky-600 hover:bg-sky-700 text-white">
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
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

      <style jsx>{`
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
