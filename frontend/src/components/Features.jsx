import React from 'react';
import { AlertCircle, MapPin, BarChart3, ShieldCheck } from 'lucide-react';
import featuresBg from '../assets/features_bg.png';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
      <Icon className="w-6 h-6 text-accent" />
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-secondary leading-relaxed">{description}</p>
  </div>
);

const Features = () => {
  const features = [
    {
      icon: AlertCircle,
      title: "Report Issues",
      description: "Quickly report delays, safety concerns, or maintenance issues directly to transit officers."
    },
    {
      icon: MapPin,
      title: "Area Tracking",
      description: "Stay informed about transport facilities and service status in your specific neighborhood."
    },
    {
      icon: BarChart3,
      title: "Gap Analysis",
      description: "Our system identifies transit gaps to help officials plan more equitable routes and facilities."
    },
    {
      icon: ShieldCheck,
      title: "Official Oversight",
      description: "Verified admins and officers can manage infrastructure and respond to your feedback in real-time."
    }
  ];

  return (
    <section 
      id="features" 
      className="py-24 relative overflow-hidden"
      style={{
        backgroundImage: `url(${featuresBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-white/90 z-0"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Everything you need for a better commute</h2>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            TransitEquity connects commuters with transportation officials to create a seamless feedback loop for public transit improvements.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
