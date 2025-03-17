
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Activity, Users, BookOpen, University } from 'lucide-react';
import ScrollReveal from './ui/ScrollReveal';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatCard = ({ icon, value, label, delay }: { icon: React.ReactNode; value: string; label: string; delay: number }) => (
  <ScrollReveal delay={delay} className="w-full">
    <div className="stat-card h-full">
      <div className="p-3 rounded-full bg-university-warm mb-4">{icon}</div>
      <h3 className="text-3xl font-bold text-university-DEFAULT mb-1">{value}</h3>
      <p className="text-sm text-gray-600 text-center">{label}</p>
    </div>
  </ScrollReveal>
);

const Statistics = () => {
  // Data for the charts
  const applicantData = [
    { name: 'Jan', value: 2400 },
    { name: 'Feb', value: 4200 },
    { name: 'Mar', value: 4800 },
    { name: 'Apr', value: 5800 },
    { name: 'May', value: 8000 },
    { name: 'Jun', value: 10000 },
  ];

  const programData = [
    { name: 'Engineering', value: 28 },
    { name: 'Business', value: 22 },
    { name: 'Medicine', value: 18 },
    { name: 'Arts', value: 15 },
    { name: 'Science', value: 17 },
  ];

  const chartConfig = {
    applications: { label: "Applications" },
    programs: { label: "Programs" }
  };

  return (
    <section id="statistics" className="py-20 bg-white">
      <div className="container px-4 mx-auto">
        <ScrollReveal>
          <h2 className="section-title text-center">Application Statistics</h2>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <p className="section-subtitle text-center">
            Real-time data insights showing application trends and program popularity
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <StatCard 
            icon={<Users className="h-6 w-6 text-university-DEFAULT" />} 
            value="45,670+" 
            label="Active Applicants"
            delay={300}
          />
          <StatCard 
            icon={<BookOpen className="h-6 w-6 text-university-DEFAULT" />} 
            value="10,234+" 
            label="Available Programs"
            delay={400}
          />
          <StatCard 
            icon={<University className="h-6 w-6 text-university-DEFAULT" />} 
            value="342" 
            label="Partner Universities"
            delay={500}
          />
          <StatCard 
            icon={<Activity className="h-6 w-6 text-university-DEFAULT" />} 
            value="92%" 
            label="Completion Rate"
            delay={600}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ScrollReveal delay={300}>
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-6">Monthly Applicant Growth</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={applicantData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3E92CC" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-6">Most Popular Fields of Study</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={programData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {programData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`hsl(${index * 45}, 70%, 50%)`} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default Statistics;
