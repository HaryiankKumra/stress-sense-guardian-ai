import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DatabaseDebugger from "@/components/DatabaseDebugger";
import AuthDebugger from "@/components/AuthDebugger";
import {
  Brain,
  Heart,
  Shield,
  Zap,
  Users,
  ChevronRight,
  Github,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Clock,
  Target,
  TrendingUp,
  Send,
  Settings,
} from "lucide-react";

const IntroductionPage: React.FC = () => {
  const [showDebugger, setShowDebugger] = useState(false);

  const teamMembers = [
    {
      name: "Arjun Sharma",
      role: "ML Engineer",
      email: "arjun@stressguard.ai",
      linkedin: "https://linkedin.com/in/arjun-sharma",
      photo:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
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
      name: "Rahul Kumar",
      role: "Full Stack Developer",
      email: "rahul@stressguard.ai",
      linkedin: "https://linkedin.com/in/rahul-kumar",
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Sneha Reddy",
      role: "UI/UX Designer",
      email: "sneha@stressguard.ai",
      linkedin: "https://linkedin.com/in/sneha-reddy",
      photo:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
  ];

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-purple-400" />,
      title: "AI-Powered Analysis",
      description:
        "Advanced machine learning algorithms analyze your physiological data in real-time to detect stress patterns.",
      gradient: "from-purple-500 to-blue-500",
    },
    {
      icon: <Heart className="w-8 h-8 text-red-400" />,
      title: "Multi-Modal Monitoring",
      description:
        "Combines heart rate, skin conductance, temperature, and facial expression analysis for comprehensive stress detection.",
      gradient: "from-red-500 to-pink-500",
    },
    {
      icon: <Shield className="w-8 h-8 text-green-400" />,
      title: "Privacy First",
      description:
        "All data processing happens locally with end-to-end encryption. Your health data remains completely private.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      title: "Real-Time Insights",
      description:
        "Get instant feedback and personalized recommendations to manage stress before it impacts your wellbeing.",
      gradient: "from-yellow-500 to-orange-500",
    },
  ];

  const stats = [
    {
      number: "95%",
      label: "Accuracy Rate",
      icon: <Target className="w-6 h-6" />,
    },
    {
      number: "24/7",
      label: "Monitoring",
      icon: <Clock className="w-6 h-6" />,
    },
    {
      number: "1000+",
      label: "Active Users",
      icon: <Users className="w-6 h-6" />,
    },
    {
      number: "98%",
      label: "Satisfaction",
      icon: <TrendingUp className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="relative max-w-7xl mx-auto px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-2xl">
                <Brain className="w-16 h-16 text-white" />
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
              Stress
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Guard
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Advanced AI-powered stress detection using physiological signals
              and facial analysis. Take control of your mental wellbeing with
              real-time insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg transform transition-all duration-200 hover:scale-105">
                  Get Started Free
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>

              <Link to="/login">
                <Button
                  variant="outline"
                  className="border-2 border-slate-300 text-slate-300 hover:bg-slate-300 hover:text-slate-900 px-8 py-3 text-lg font-semibold rounded-full transition-all duration-200"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Advanced Features
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Cutting-edge technology meets intuitive design to provide
              comprehensive stress management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 transform hover:scale-105"
              >
                <CardHeader>
                  <div
                    className={`w-16 h-16 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}
                  >
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white text-xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Passionate experts in AI, healthcare, and technology working to
              revolutionize stress management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 transform hover:scale-105"
              >
                <CardContent className="p-6 text-center">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-500/30"
                  />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {member.name}
                  </h3>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-4">
                    {member.role}
                  </Badge>
                  <div className="flex justify-center space-x-3">
                    <a
                      href={member.linkedin}
                      className="text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                      href={`mailto:${member.email}`}
                      className="text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Debug Section (Development Only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="py-10 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-8">
              <Button
                onClick={() => setShowDebugger(!showDebugger)}
                variant="outline"
                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                {showDebugger ? "Hide" : "Show"} Developer Tools
              </Button>
            </div>

            {showDebugger && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AuthDebugger />
                  <DatabaseDebugger />
                </div>
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-white text-lg font-semibold mb-4">
                      Quick Development Info
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="text-slate-300 font-medium mb-2">
                          Backend Status
                        </h4>
                        <p className="text-slate-400">
                          • Supabase: Check connection above
                        </p>
                        <p className="text-slate-400">
                          • Mock Auth: Always available
                        </p>
                        <p className="text-slate-400">
                          • Sample Data: Ready to initialize
                        </p>
                      </div>
                      <div>
                        <h4 className="text-slate-300 font-medium mb-2">
                          Known Issues Fixed
                        </h4>
                        <p className="text-green-400">
                          ✅ Container/box styling removed
                        </p>
                        <p className="text-green-400">
                          ✅ Contact section restored
                        </p>
                        <p className="text-green-400">✅ Sample data added</p>
                        <p className="text-green-400">
                          ✅ Authentication working
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Contact Us
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Have questions about StressGuard? We'd love to hear from you. Send
              us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center">
                  <Send className="w-6 h-6 mr-3 text-blue-400" />
                  Send Message
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What is this about?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 text-lg font-semibold rounded-lg">
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Mail className="w-6 h-6 text-blue-400 mr-3" />
                    <h3 className="text-xl font-semibold text-white">
                      Email Us
                    </h3>
                  </div>
                  <p className="text-slate-300 mb-2">info@stressguard.ai</p>
                  <p className="text-slate-400 text-sm">
                    We typically respond within 24 hours
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Phone className="w-6 h-6 text-green-400 mr-3" />
                    <h3 className="text-xl font-semibold text-white">
                      Call Us
                    </h3>
                  </div>
                  <p className="text-slate-300 mb-2">+1 (555) 123-4567</p>
                  <p className="text-slate-400 text-sm">Mon-Fri 9AM-6PM PST</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <MapPin className="w-6 h-6 text-purple-400 mr-3" />
                    <h3 className="text-xl font-semibold text-white">
                      Visit Us
                    </h3>
                  </div>
                  <p className="text-slate-300 mb-2">123 Innovation Drive</p>
                  <p className="text-slate-300 mb-2">San Francisco, CA 94105</p>
                  <p className="text-slate-400 text-sm">By appointment only</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Follow Us
                  </h3>
                  <div className="flex space-x-4">
                    <Github className="w-8 h-8 text-slate-300 hover:text-white cursor-pointer transition-colors" />
                    <Linkedin className="w-8 h-8 text-slate-300 hover:text-white cursor-pointer transition-colors" />
                    <Mail className="w-8 h-8 text-slate-300 hover:text-white cursor-pointer transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto text-center px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Wellbeing?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already taking control of their
            stress with StressGuard's AI-powered insights.
          </p>

          <Link to="/signup">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-12 py-4 text-xl font-semibold rounded-full shadow-2xl transform transition-all duration-200 hover:scale-105">
              Start Your Journey Today
              <ChevronRight className="ml-3 w-6 h-6" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/80 backdrop-blur-sm border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <Brain className="w-8 h-8 text-blue-400 mr-3" />
                <span className="text-2xl font-bold text-white">
                  StressGuard
                </span>
              </div>
              <p className="text-slate-400 mb-4 max-w-md">
                Advanced AI-powered stress detection and management platform for
                better mental health.
              </p>
              <div className="flex space-x-4">
                <Github className="w-6 h-6 text-slate-400 hover:text-white cursor-pointer transition-colors" />
                <Linkedin className="w-6 h-6 text-slate-400 hover:text-white cursor-pointer transition-colors" />
                <Mail className="w-6 h-6 text-slate-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center text-slate-400">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>info@stressguard.ai</span>
                </div>
                <div className="flex items-center text-slate-400">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center text-slate-400">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block text-slate-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block text-slate-400 hover:text-white transition-colors"
                >
                  Sign Up
                </Link>
                <a
                  href="#"
                  className="block text-slate-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="block text-slate-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-8 pt-8 text-center">
            <p className="text-slate-400">
              © 2024 StressGuard. All rights reserved. Built with ❤️ for better
              mental health.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IntroductionPage;
