
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Brain, Heart, Activity, Zap, Users, Target, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const IntroductionPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">StressGuard AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-slate-300 hover:text-white transition-colors">About</a>
            <a href="#team" className="text-slate-300 hover:text-white transition-colors">Team</a>
            <a href="#research" className="text-slate-300 hover:text-white transition-colors">Research</a>
            <a href="#technology" className="text-slate-300 hover:text-white transition-colors">Technology</a>
            <Link to="/" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
              Open Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="space-y-6">
              <h1 className="text-6xl font-bold text-white leading-tight">
                Your <span className="text-purple-400">stress</span><br />
                <span className="text-green-400">speaks</span>
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed">
                AI-powered biometric technology to detect<br />
                and manage stress in real-time
              </p>
              <div className="flex items-center gap-4">
                <Link to="/#what-we-do">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3">
                    What we do
                  </Button>
                </Link>
                <Link to="/#how-it-works">
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 px-6 py-3">
                    How it works
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="w-96 h-96 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-green-400/20 rounded-full animate-pulse"></div>
              <div className="absolute inset-4 bg-gradient-to-r from-purple-500/30 to-green-300/30 rounded-full animate-pulse delay-75"></div>
              <div className="absolute inset-8 bg-gradient-to-r from-purple-400/40 to-green-200/40 rounded-full animate-pulse delay-150"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="w-24 h-24 text-purple-400 animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="about" className="bg-slate-800/30 py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="w-80 h-80 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg transform rotate-6"></div>
                <div className="absolute inset-4 bg-slate-700/50 rounded-lg flex items-center justify-center">
                  <Heart className="w-32 h-32 text-green-400" />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">OUR MISSION</Badge>
              <h2 className="text-4xl font-bold text-white">
                Unlock biometrics as a <span className="text-green-400">vital sign</span> and meaningful predictor of stress
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-lg">+</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  We are developing an AI-powered biometric technology platform with the potential to transform the way we monitor and diagnose stress-related conditions through real-time physiological analysis
                </p>
              </div>
              <div className="flex items-center gap-2 text-purple-400 cursor-pointer hover:text-purple-300 transition-colors">
                <span>Learn more about our research</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detection Capabilities */}
      <section id="research" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-4">We can detect</Badge>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-white">Acute Stress</h2>
              <h2 className="text-4xl font-bold text-slate-400">Chronic Fatigue</h2>
              <h2 className="text-4xl font-bold text-slate-400">Anxiety Levels</h2>
              <h2 className="text-4xl font-bold text-slate-400">Heart Rate Variability</h2>
            </div>
          </div>

          {/* Detection Visual */}
          <div className="relative max-w-2xl mx-auto">
            <div className="w-96 h-96 mx-auto relative">
              <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
              <div className="absolute inset-8 border-4 border-green-500/30 rounded-full"></div>
              <div className="absolute inset-16 border-4 border-blue-500/30 rounded-full"></div>
              <div className="absolute inset-24 border-4 border-yellow-500/30 rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Target className="w-16 h-16 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="mt-12 max-w-2xl mx-auto">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <p className="text-slate-300 leading-relaxed mb-4">
                  Stress and anxiety can significantly impact our daily lives and overall well-being. Through continuous monitoring of physiological signals, our system can detect early signs of stress and provide timely interventions.
                </p>
                <Button variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20">
                  Learn more
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="bg-slate-800/30 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-4">Steeped in research</Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Real-time Analysis</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Continuous monitoring and analysis of biometric data with instant stress detection
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI-Powered Detection</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Advanced machine learning models trained on thousands of physiological samples
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Multi-sensor Integration</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Combining GSR, heart rate, temperature, and facial expression analysis
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Comparison */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="space-y-8">
                <div>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mb-4">Technology used differently</Badge>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-lg">+</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        <span className="text-purple-400">Traditional</span> monitoring
                      </h3>
                      <p className="text-slate-300">
                        Periodic health checkups and manual stress assessments provide limited insight
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-lg">+</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        <span className="text-green-400">Real-time</span> detection
                      </h3>
                      <p className="text-slate-300">
                        Continuous biometric monitoring unlocks true potential of preventive healthcare
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="w-80 h-80 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-green-400/10 rounded-lg"></div>
                <div className="absolute inset-4 bg-slate-800/80 rounded-lg border border-slate-600 flex items-center justify-center">
                  <Activity className="w-32 h-32 text-green-400 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="bg-slate-800/30 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-4">Our Team</Badge>
            <h2 className="text-4xl font-bold text-white mb-6">Built by passionate researchers</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Our multidisciplinary team combines expertise in AI, biomedical engineering, and healthcare to create innovative stress detection solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">AI</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">AI Research Team</h3>
                <p className="text-slate-300 text-sm">Machine Learning & Neural Networks</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Biomedical Engineers</h3>
                <p className="text-slate-300 text-sm">Sensor Integration & Signal Processing</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Healthcare Experts</h3>
                <p className="text-slate-300 text-sm">Clinical Validation & User Experience</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Hardware & Technology */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-4">Hardware & Technology</Badge>
            <h2 className="text-4xl font-bold text-white mb-6">Cutting-edge sensor integration</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-purple-400 font-mono text-sm mb-2">ESP32</div>
                <h4 className="text-white font-semibold mb-2">Microcontroller</h4>
                <p className="text-slate-400 text-xs">Wi-Fi enabled processing unit</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-green-400 font-mono text-sm mb-2">GSR</div>
                <h4 className="text-white font-semibold mb-2">Skin Conductance</h4>
                <p className="text-slate-400 text-xs">Galvanic skin response sensor</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-red-400 font-mono text-sm mb-2">PPG</div>
                <h4 className="text-white font-semibold mb-2">Heart Rate</h4>
                <p className="text-slate-400 text-xs">Photoplethysmography sensor</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-blue-400 font-mono text-sm mb-2">DS18B20</div>
                <h4 className="text-white font-semibold mb-2">Temperature</h4>
                <p className="text-slate-400 text-xs">Digital temperature sensor</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-300 mb-6">Powered by advanced AI models trained on the WESAD dataset</p>
            <div className="flex justify-center gap-4">
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">TensorFlow.js</Badge>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Real-time Processing</Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">97% Accuracy</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600/20 to-green-400/20 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to monitor your stress?</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Experience the future of stress detection with our AI-powered biometric monitoring system
          </p>
          <Link to="/">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg">
              Open Dashboard
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-purple-400" />
                <span className="text-xl font-bold text-white">StressGuard AI</span>
              </div>
              <p className="text-slate-400 text-sm">© 2024 StressGuard AI. All rights reserved.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Technology</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div>AI & Machine Learning</div>
                <div>Biometric Sensors</div>
                <div>Real-time Processing</div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Research</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div>WESAD Dataset</div>
                <div>Clinical Validation</div>
                <div>Peer Review</div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div>Research Team</div>
                <div>Technical Support</div>
                <div>Partnerships</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IntroductionPage;
