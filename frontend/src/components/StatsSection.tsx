import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const StatsSection = () => {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('/api/enrollment/stats/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setStatsData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load statistics');
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
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

  if (loading) {
    return (
      <section id="stats" className="section bg-gray-50 dark:bg-navy-dark/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="stats" className="section bg-gray-50 dark:bg-navy-dark/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title">Application Statistics</h2>
            <div className="bg-red-50 p-4 rounded-lg max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Format data for chart
  const chartData = statsData?.popular_programs?.map(program => ({
    name: program.name,
    value: program.applicant_count,
    fill: program.fill || '#0d9488' // Default color if not provided
  })) || [];

  // Calculate days remaining until deadline
  const deadlineDate = new Date(statsData?.deadline || '2025-04-30');
  const today = new Date();
  const daysRemaining = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

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
                {chartData.length > 0 ? (
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
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No program data available
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md dark:bg-navy-dark/50 dark:border dark:border-white/10 animate-fade-in animate-delay-100">
              <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center mb-4">
                <Users className="text-teal" size={24} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-navy mb-2 dark:text-white">
                {statsData?.total_applicants?.toLocaleString() || '0'}
              </h3>
              <p className="text-slate font-medium">Active Applicants</p>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp size={14} className="mr-1" />
                <span>{statsData?.applicant_growth || '0'}% increase from previous cycle</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md dark:bg-navy-dark/50 dark:border dark:border-white/10 animate-fade-in animate-delay-200">
              <div className="w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="text-navy dark:text-teal" size={24} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-navy mb-2 dark:text-white">
                {statsData?.total_programs?.toLocaleString() || '0'}
              </h3>
              <p className="text-slate font-medium">Programs Available</p>
              <div className="mt-4 flex items-center text-sm text-teal">
                <span>Across {statsData?.total_universities || '0'} participating universities</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md dark:bg-navy-dark/50 dark:border dark:border-white/10 animate-fade-in animate-delay-300">
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-gold" size={24} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-navy mb-2 dark:text-white">
                {statsData?.avg_processing_time || '0'} days
              </h3>
              <p className="text-slate font-medium">Avg. Processing Time</p>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp size={14} className="mr-1" />
                <span>{statsData?.processing_improvement || '0'} days faster than last year</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal to-navy-light rounded-xl p-6 shadow-md animate-fade-in animate-delay-400">
              <h3 className="text-2xl font-bold text-white mb-4">Application Deadline</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 mb-1">Fall Semester</p>
                  <p className="text-white font-medium">
                    {deadlineDate.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{daysRemaining > 0 ? daysRemaining : 0}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-white/80 text-sm">
                  {daysRemaining > 0 ? 'Days remaining to apply' : 'Application period has ended'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;