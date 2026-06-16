// e:/AI Talent OS/src/App.tsx
import { useStore } from './store/useStore';
import { Navbar } from './components/Navbar/Navbar';
import { Sidebar } from './components/Sidebar/Sidebar';

// Pages
import { Dashboard } from './pages/Dashboard/Dashboard';
import { ResumeAnalyzer } from './pages/ResumeAnalyzer/ResumeAnalyzer';
import { JobMatcher } from './pages/JobMatcher/JobMatcher';
import { InterviewAssistant } from './pages/InterviewAssistant/InterviewAssistant';
import { SkillGapDetector } from './pages/SkillGapDetector/SkillGapDetector';
import { CareerCoach } from './pages/CareerCoach/CareerCoach';
import { Learning } from './pages/Learning/Learning';
import { RecruiterPortal } from './pages/RecruiterPortal/RecruiterPortal';
import { Analytics } from './pages/Analytics/Analytics';
import { Logs } from './pages/Logs/Logs';

function App() {
  const { activePage } = useStore();

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'analyzer':
        return <ResumeAnalyzer />;
      case 'matcher':
        return <JobMatcher />;
      case 'interview':
        return <InterviewAssistant />;
      case 'gap':
        return <SkillGapDetector />;
      case 'coach':
        return <CareerCoach />;
      case 'learning':
        return <Learning />;
      case 'recruiter':
        return <RecruiterPortal />;
      case 'analytics':
        return <Analytics />;
      case 'logs':
        return <Logs />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-brand-black text-white select-none">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic content page */}
        <main className="flex-1 overflow-hidden bg-brand-dark flex flex-col">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

export default App;
