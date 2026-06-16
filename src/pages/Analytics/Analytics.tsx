// e:/AI Talent OS/src/pages/Analytics/Analytics.tsx
import React from 'react';
import { useStore } from '../../store/useStore';
import { GlassCard } from '../../components/GlassCard/GlassCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, Award, UserCheck } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const Analytics: React.FC = () => {
  const { candidates } = useStore();

  // 1. Line Chart Data: Application trends over last few months
  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Applications Received',
        data: [12, 19, 32, 28, 45, 55],
        borderColor: '#3F4EFF',
        backgroundColor: 'rgba(63, 78, 255, 0.15)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Interviews Completed',
        data: [5, 12, 15, 20, 30, 38],
        borderColor: '#00E5FF',
        backgroundColor: 'rgba(0, 229, 255, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  // 2. Bar Chart Data: Resume Scores distribution
  const scoreIntervals = ['60-70', '70-80', '80-90', '90-100'];
  const scoreCounts = [0, 0, 0, 0];
  candidates.forEach(c => {
    if (c.resumeScore >= 90) scoreCounts[3]++;
    else if (c.resumeScore >= 80) scoreCounts[2]++;
    else if (c.resumeScore >= 70) scoreCounts[1]++;
    else scoreCounts[0]++;
  });

  const barData = {
    labels: scoreIntervals,
    datasets: [
      {
        label: 'Number of Applicants',
        data: scoreCounts,
        backgroundColor: '#00E5FF',
        borderRadius: 6,
      }
    ]
  };

  // 3. Radar Chart Data: Skills Distribution matching candidates vs target requirements
  const radarData = {
    labels: ['Python', 'PyTorch', 'Docker', 'AWS', 'SQL', 'React', 'Node.js'],
    datasets: [
      {
        label: 'Candidate Inventory',
        data: [90, 75, 60, 50, 80, 45, 55],
        backgroundColor: 'rgba(63, 78, 255, 0.2)',
        borderColor: '#3F4EFF',
        borderWidth: 2,
        pointBackgroundColor: '#3F4EFF',
      },
      {
        label: 'Market Demand',
        data: [95, 85, 75, 80, 85, 60, 65],
        backgroundColor: 'rgba(0, 229, 255, 0.15)',
        borderColor: '#00E5FF',
        borderWidth: 2,
        pointBackgroundColor: '#00E5FF',
      }
    ]
  };

  // 4. Doughnut Chart Data: Candidate Stages count
  const stageLabels = ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Selected'];
  const stageCounts = [
    candidates.filter(c => c.stage === 'applied').length,
    candidates.filter(c => c.stage === 'screening').length,
    candidates.filter(c => c.stage === 'shortlisted').length,
    candidates.filter(c => c.stage === 'interview').length,
    candidates.filter(c => c.stage === 'selected').length
  ];

  const doughnutData = {
    labels: stageLabels,
    datasets: [
      {
        data: stageCounts,
        backgroundColor: [
          'rgba(63, 78, 255, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(0, 229, 255, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderColor: '#09090b',
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#A1A1AA',
          font: { family: 'Plus Jakarta Sans', size: 10 }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: { color: '#A1A1AA', font: { size: 9 } }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: { color: '#A1A1AA', font: { size: 9 } }
      }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#A1A1AA', font: { size: 10 } }
      }
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(255,255,255,0.05)' },
        grid: { color: 'rgba(255,255,255,0.05)' },
        pointLabels: { color: '#A1A1AA', font: { size: 9 } },
        ticks: { backdropColor: 'transparent', color: '#A1A1AA', font: { size: 8 } }
      }
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 grid-bg relative">
      <div className="glow-orb-indigo top-1/4 right-1/4 animate-pulse-slow"></div>
      <div className="glow-orb-cyan bottom-1/4 left-1/4 animate-pulse-slow"></div>

      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white">System Analytics</h1>
          <p className="text-brand-silver text-sm mt-0.5">Statistical breakdowns of training progress and hiring rates.</p>
        </div>

        {/* Funnel overview metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GlassCard className="flex items-center gap-4">
            <div className="p-3 bg-brand-indigo/10 border border-brand-indigo/20 text-brand-cyan rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] text-brand-silver uppercase">Monthly growth</div>
              <div className="text-xl font-bold text-white mt-0.5">+22% Application increase</div>
            </div>
          </GlassCard>
          <GlassCard className="flex items-center gap-4">
            <div className="p-3 bg-brand-success/10 border border-brand-success/20 text-brand-success rounded-lg">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] text-brand-silver uppercase">Interview Success Rate</div>
              <div className="text-xl font-bold text-white mt-0.5">68% Pass Rate</div>
            </div>
          </GlassCard>
          <GlassCard className="flex items-center gap-4">
            <div className="p-3 bg-pink-500/10 border border-pink-500/20 text-pink-500 rounded-lg">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] text-brand-silver uppercase">Average resume grade</div>
              <div className="text-xl font-bold text-white mt-0.5">85% Compatibility</div>
            </div>
          </GlassCard>
        </div>

        {/* Chart displays grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Trends line chart */}
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="font-display font-extrabold text-xs text-white uppercase tracking-wider">Application Submissions</h3>
              <span className="text-[9px] text-brand-cyan">Year-to-date</span>
            </div>
            <div className="h-64">
              <Line data={lineData} options={chartOptions} />
            </div>
          </GlassCard>

          {/* Scores bar chart */}
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="font-display font-extrabold text-xs text-white uppercase tracking-wider">Resume Scoring Profile</h3>
              <span className="text-[9px] text-brand-cyan">Audited database</span>
            </div>
            <div className="h-64">
              <Bar data={barData} options={chartOptions} />
            </div>
          </GlassCard>

          {/* Skills Radar */}
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="font-display font-extrabold text-xs text-white uppercase tracking-wider">Skills Supply vs Demand</h3>
              <span className="text-[9px] text-brand-cyan">7 key parameters</span>
            </div>
            <div className="h-64">
              <Radar data={radarData} options={radarOptions} />
            </div>
          </GlassCard>

          {/* Pipeline stages doughnut */}
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="font-display font-extrabold text-xs text-white uppercase tracking-wider">Candidate Pipelines</h3>
              <span className="text-[9px] text-brand-cyan">Current active funnel</span>
            </div>
            <div className="h-64 relative flex items-center justify-center">
              <Doughnut data={doughnutData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const,
                    labels: { color: '#A1A1AA', font: { size: 9 } }
                  }
                }
              }} />
            </div>
          </GlassCard>

        </div>

      </div>
    </div>
  );
};
