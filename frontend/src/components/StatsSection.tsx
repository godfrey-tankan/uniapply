
import React from 'react';
import { Users, TrendingUp, Clock, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

const StatsSection = () => {
  const chartData = [
    { name: 'Engineering', value: 3254, fill: '#0d9488' },
    { name: 'Business', value: 2954, fill: '#1a365d' },
    { name: 'Medicine', value: 2456, fill: '#0f766e' },
    { name: 'Computer Science', value: 2345, fill: '#0d9488' },
    { name: 'Law', value: 1876, fill: '#1a365d' },
    { name: 'Arts', value: 1543, fill: '#0f766e' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white shadow-md rounded-md border border-slate/10">
          <p className="font-medium text-navy-dark">{label}</p>
          <p className="text-teal">{`${payload[0].value} Applicants`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <section id="stats" className="section bg-gray-50 dark:bg-navy-dark/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title">Application Statistics</h2>
          <p className="section-subtitle">
            Track real-time application trends across universities and programs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div className="bg-white rounded-xl shadow-md p-6 dark:bg-navy-dark/50 dark:border dark:border-white/10">
              <h3 className="text-xl font-bold text-navy mb-6 dark:text-white">Most Applied Programs</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
                    <XAxis type="number" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8' }} 
                      width={100}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar 
                      dataKey="value" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md dark:bg-navy-dark/50 dark:border dark:border-white/10 animate-fade-in animate-delay-100">
              <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center mb-4">
                <Users className="text-teal" size={24} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-navy mb-2 dark:text-white">24,578</h3>
              <p className="text-slate font-medium">Active Applicants</p>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp size={14} className="mr-1" />
                <span>12% increase from previous cycle</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md dark:bg-navy-dark/50 dark:border dark:border-white/10 animate-fade-in animate-delay-200">
              <div className="w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="text-navy dark:text-teal" size={24} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-navy mb-2 dark:text-white">487</h3>
              <p className="text-slate font-medium">Programs Available</p>
              <div className="mt-4 flex items-center text-sm text-teal">
                <span>Across 128 participating universities</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md dark:bg-navy-dark/50 dark:border dark:border-white/10 animate-fade-in animate-delay-300">
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-gold" size={24} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-navy mb-2 dark:text-white">42 days</h3>
              <p className="text-slate font-medium">Avg. Processing Time</p>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp size={14} className="mr-1" />
                <span>3 days faster than last year</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-teal to-navy-light rounded-xl p-6 shadow-md animate-fade-in animate-delay-400">
              <h3 className="text-2xl font-bold text-white mb-4">Application Deadline</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 mb-1">Fall Semester</p>
                  <p className="text-white font-medium">March 30, 2024</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">58</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-white/80 text-sm">Days remaining to apply</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
