// e:/AI Talent OS/src/pages/JobMatcher/JobMatcher.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useStore, type TrackedJob, type JobPipelineStage } from '../../store/useStore';
import { getGeminiClient, type CareerInsight } from '../../services/geminiService';
import { searchJobs, type JSearchJob } from '../../services/jobService';
import { GlassCard } from '../../components/GlassCard/GlassCard';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Search,
  Briefcase,
  Bookmark,
  BookmarkCheck,
  MapPin,
  DollarSign,
  Clock,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Lightbulb,
  BarChart3,
  GripVertical,
  Trash2,
  Sparkles,
  AlertCircle,
  Building2,
  Filter,
} from 'lucide-react';

// ─────────────────────────── Tab types ───────────────────────────
type TabId = 'search' | 'pipeline' | 'insights';

// ─────────────────────────── Kanban Pipeline Columns ───────────────────────────
const PIPELINE_COLUMNS: { id: JobPipelineStage; label: string; color: string }[] = [
  { id: 'saved', label: 'Saved', color: '#3F4EFF' },
  { id: 'applied', label: 'Applied', color: '#00E5FF' },
  { id: 'screening', label: 'Screening', color: '#F59E0B' },
  { id: 'interview', label: 'Interview', color: '#EC4899' },
  { id: 'offer', label: 'Offer', color: '#10B981' },
  { id: 'rejected', label: 'Rejected', color: '#EF4444' },
];

// ─────────────────────────── Sortable Card ───────────────────────────
const SortableJobCard: React.FC<{
  job: TrackedJob;
  color: string;
  onRemove: (id: string) => void;
}> = ({ job, color, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: job.id,
    data: { stage: job.stage },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass-panel p-3 space-y-2 cursor-grab active:cursor-grabbing group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0" {...attributes} {...listeners}>
          <GripVertical className="h-3.5 w-3.5 text-brand-silver/40 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{job.title}</p>
            <p className="text-[10px] text-brand-silver truncate">{job.company}</p>
          </div>
        </div>
        <button
          onClick={() => onRemove(job.id)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-brand-error/10 text-brand-silver hover:text-brand-error transition-all"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-brand-silver flex items-center gap-1">
          <MapPin className="h-2.5 w-2.5" />
          {job.location.length > 22 ? job.location.slice(0, 22) + '…' : job.location}
        </span>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border"
          style={{ color, borderColor: color + '40', backgroundColor: color + '10' }}
        >
          {job.matchScore}%
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────── Kanban Column ───────────────────────────
const PipelineColumn: React.FC<{
  column: (typeof PIPELINE_COLUMNS)[number];
  jobs: TrackedJob[];
  onRemove: (id: string) => void;
}> = ({ column, jobs, onRemove }) => {
  return (
    <div className="flex flex-col min-w-[200px] w-[200px] shrink-0">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: column.color }} />
        <span className="text-[10px] font-bold text-white uppercase tracking-wider">
          {column.label}
        </span>
        <span className="text-[9px] text-brand-silver ml-auto bg-white/5 px-1.5 py-0.5 rounded-full">
          {jobs.length}
        </span>
      </div>
      <div className="flex-1 space-y-2 min-h-[120px] p-2 rounded-xl border border-dashed border-brand-border/30 bg-white/[0.01]">
        <SortableContext items={jobs.map((j) => j.id)} strategy={verticalListSortingStrategy}>
          {jobs.length === 0 ? (
            <div className="flex items-center justify-center h-[100px] text-[10px] text-brand-silver/40">
              Drop jobs here
            </div>
          ) : (
            jobs.map((job) => (
              <SortableJobCard key={job.id} job={job} color={column.color} onRemove={onRemove} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};

// ─────────────────────────── Match Score Ring ───────────────────────────
const MatchScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 48 }) => {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 85 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="3" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold text-white">{score}%</span>
      </div>
    </div>
  );
};

// ─────────────────────────── Main Component ───────────────────────────
export const JobMatcher: React.FC = () => {
  const {
    userProfile,
    apiSettings,
    trackedJobs,
    addTrackedJob,
    updateTrackedJobStage,
    removeTrackedJob,
    addActivityLog,
    addNotification,
  } = useStore();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>('search');

  // Search state
  const [searchQuery, setSearchQuery] = useState(userProfile.targetRole || '');
  const [searchLocation, setSearchLocation] = useState('');
  const [employmentFilter, setEmploymentFilter] = useState('');
  const [searchResults, setSearchResults] = useState<JSearchJob[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [dataSource, setDataSource] = useState<'api' | 'fallback'>('fallback');

  // Match state (per-job)
  const [matchingJobId, setMatchingJobId] = useState<string | null>(null);
  const [matchResults, setMatchResults] = useState<
    Record<string, { score: number; matching: string[]; missing: string[]; rating: string; details: string }>
  >({});

  // Insights state
  const [insights, setInsights] = useState<CareerInsight | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // ── Search Handler ────────────────────────────────────────────
  const handleSearch = useCallback(
    async (page = 1) => {
      if (!searchQuery.trim()) return;
      setSearchLoading(true);
      setSearchError('');

      try {
        const result = await searchJobs({
          query: searchQuery,
          location: searchLocation || undefined,
          employmentType: employmentFilter || undefined,
          page,
        });

        setSearchResults(result.jobs);
        setTotalResults(result.totalResults);
        setHasMore(result.hasMore);
        setCurrentPage(result.page);
        setDataSource(result.source);

        if (page === 1 && result.jobs.length > 0) {
          addNotification({
            type: 'info',
            message: `Found ${result.totalResults} jobs matching "${searchQuery}"`,
          });
        }
      } catch {
        setSearchError('Failed to fetch job listings. Please try again.');
      } finally {
        setSearchLoading(false);
      }
    },
    [searchQuery, searchLocation, employmentFilter, addNotification]
  );

  // Auto-search on mount if targetRole is set
  useEffect(() => {
    if (userProfile.targetRole && searchResults.length === 0) {
      handleSearch(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Match Job Handler ─────────────────────────────────────────
  const handleMatchJob = async (job: JSearchJob) => {
    setMatchingJobId(job.id);
    try {
      const gemini = getGeminiClient(apiSettings.geminiKey, apiSettings.isSimulator);
      const res = await gemini.matchJob(userProfile.skills, job.description);
      setMatchResults((prev) => ({
        ...prev,
        [job.id]: {
          score: res.matchPercentage,
          matching: res.matchingSkills,
          missing: res.missingSkills,
          rating: res.suitabilityRating,
          details: res.suitabilityDetails,
        },
      }));
    } catch (error) {
      console.error('Match error:', error);
    } finally {
      setMatchingJobId(null);
    }
  };

  // ── Track Job ─────────────────────────────────────────────────
  const handleTrackJob = (job: JSearchJob, stage: JobPipelineStage = 'saved') => {
    const isAlreadyTracked = trackedJobs.some((tj) => tj.jobId === job.id);
    if (isAlreadyTracked) return;

    addTrackedJob({
      jobId: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      matchScore: matchResults[job.id]?.score || 0,
      stage,
      applyUrl: job.applyUrl,
    });
  };

  // ── Kanban Drag End ───────────────────────────────────────────
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const draggedJobId = active.id as string;

    // Determine the target column
    let targetStage: JobPipelineStage | null = null;

    // Check if dropped over a column container or another card
    const overData = over.data?.current;
    if (overData?.stage) {
      targetStage = overData.stage as JobPipelineStage;
    } else {
      // Dropped on another card — find that card's stage
      const overJob = trackedJobs.find((tj) => tj.id === over.id);
      if (overJob) {
        targetStage = overJob.stage;
      }
    }

    if (targetStage) {
      const draggedJob = trackedJobs.find((tj) => tj.id === draggedJobId);
      if (draggedJob && draggedJob.stage !== targetStage) {
        updateTrackedJobStage(draggedJobId, targetStage);
      }
    }
  };

  // ── Fetch Career Insights ─────────────────────────────────────
  const handleFetchInsights = async () => {
    setInsightsLoading(true);
    try {
      const gemini = getGeminiClient(apiSettings.geminiKey, apiSettings.isSimulator);
      const result = await gemini.getCareerInsights(userProfile.targetRole, userProfile.skills);
      setInsights(result);
      addActivityLog('Career insights report generated.');
    } catch (error) {
      console.error('Insights error:', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  // ─────────────────────────── TABS CONFIG ───────────────────────────
  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'search', label: 'Job Search', icon: <Search className="h-3.5 w-3.5" /> },
    { id: 'pipeline', label: 'ATS Pipeline', icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { id: 'insights', label: 'Career Insights', icon: <TrendingUp className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 grid-bg relative">
      <div className="glow-orb-indigo top-20 right-10 animate-pulse-slow" />
      <div className="glow-orb-cyan bottom-20 left-10 animate-pulse-slow" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold font-display text-white">AI Job Matcher</h1>
            <p className="text-brand-silver text-sm mt-1">
              Search real positions, track applications, and get AI-powered career insights.
            </p>
          </div>
          {dataSource === 'api' && (
            <span className="text-[9px] font-bold text-brand-success bg-brand-success/10 border border-brand-success/20 px-2 py-1 rounded-full">
              ● Live API Data
            </span>
          )}
          {dataSource === 'fallback' && searchResults.length > 0 && (
            <span className="text-[9px] font-bold text-brand-warning bg-brand-warning/10 border border-brand-warning/20 px-2 py-1 rounded-full">
              ● Curated Dataset
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-brand-border/20 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-indigo text-white shadow-[0_0_15px_rgba(63,78,255,0.3)]'
                  : 'text-brand-silver hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'pipeline' && trackedJobs.length > 0 && (
                <span className="ml-1 text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full">
                  {trackedJobs.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════ SEARCH TAB ════════════════════════════════ */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <GlassCard className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Filter className="h-4 w-4 text-brand-cyan" />
                <h2 className="text-sm font-bold font-display text-white">Search Filters</h2>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch(1);
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-silver" />
                  <input
                    type="text"
                    placeholder="Job title or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-xs text-white outline-none focus:border-brand-cyan transition"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-silver" />
                  <input
                    type="text"
                    placeholder="Location (city, state)..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-xs text-white outline-none focus:border-brand-cyan transition"
                  />
                </div>
                <select
                  value={employmentFilter}
                  onChange={(e) => setEmploymentFilter(e.target.value)}
                  className="bg-brand-dark border border-brand-border rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-brand-cyan transition"
                >
                  <option value="">All Types</option>
                  <option value="FULLTIME">Full-time</option>
                  <option value="PARTTIME">Part-time</option>
                  <option value="CONTRACTOR">Contract</option>
                  <option value="INTERN">Internship</option>
                </select>
                <button
                  type="submit"
                  disabled={searchLoading || !searchQuery.trim()}
                  className="px-5 py-2.5 rounded-xl bg-brand-indigo hover:bg-brand-indigo/80 disabled:opacity-50 text-white font-bold text-xs transition shadow-[0_0_15px_rgba(63,78,255,0.3)] flex items-center justify-center gap-2"
                >
                  {searchLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Search className="h-3.5 w-3.5" />
                  )}
                  {searchLoading ? 'Searching...' : 'Search Jobs'}
                </button>
              </form>
            </GlassCard>

            {/* Error State */}
            {searchError && (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-brand-error/20 bg-brand-error/5 text-brand-error text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {searchError}
              </div>
            )}

            {/* Loading State */}
            {searchLoading && (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="h-12 w-12 rounded-full border-4 border-white/5 border-t-brand-cyan animate-spin" />
                <p className="text-xs text-brand-silver">Searching job databases...</p>
              </div>
            )}

            {/* Results */}
            {!searchLoading && searchResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-brand-silver">
                    Showing <span className="text-white font-bold">{searchResults.length}</span> of{' '}
                    <span className="text-white font-bold">{totalResults}</span> results
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {searchResults.map((job) => {
                    const match = matchResults[job.id];
                    const isTracked = trackedJobs.some((tj) => tj.jobId === job.id);
                    const isMatching = matchingJobId === job.id;

                    return (
                      <GlassCard
                        key={job.id}
                        className="flex flex-col justify-between space-y-4 hover:border-brand-indigo/35 transition"
                      >
                        {/* Header */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-sm text-white">{job.title}</h3>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Building2 className="h-3 w-3 text-brand-cyan" />
                                <p className="text-xs font-medium text-brand-cyan">{job.company}</p>
                              </div>
                            </div>
                            {match && <MatchScoreRing score={match.score} />}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[10px] text-brand-silver">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {job.salary}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {job.postedDate}
                            </span>
                            {job.isRemote && (
                              <span className="px-1.5 py-0.5 rounded-full bg-brand-success/10 border border-brand-success/20 text-brand-success text-[9px] font-bold">
                                Remote
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-brand-silver leading-relaxed line-clamp-3">
                            {job.description}
                          </p>
                        </div>

                        {/* Match Details (expanded) */}
                        {match && (
                          <div className="space-y-2 border-t border-brand-border/30 pt-3">
                            <div className="flex items-center gap-2">
                              <span
                                className="px-2 py-0.5 rounded-full text-[9px] font-bold border"
                                style={{
                                  borderColor:
                                    match.rating === 'High'
                                      ? '#10b981'
                                      : match.rating === 'Medium'
                                      ? '#f59e0b'
                                      : '#ef4444',
                                  color:
                                    match.rating === 'High'
                                      ? '#10b981'
                                      : match.rating === 'Medium'
                                      ? '#f59e0b'
                                      : '#ef4444',
                                }}
                              >
                                {match.rating} Suitability
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {match.matching.slice(0, 4).map((s, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded bg-brand-success/10 text-brand-success text-[9px] font-bold border border-brand-success/20"
                                >
                                  ✓ {s}
                                </span>
                              ))}
                              {match.missing.slice(0, 3).map((s, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded bg-brand-error/10 text-brand-error text-[9px] font-bold border border-brand-error/20"
                                >
                                  ⚠ {s}
                                </span>
                              ))}
                            </div>
                            <p className="text-[10px] text-brand-silver leading-relaxed">
                              {match.details}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-brand-border/40">
                          <button
                            onClick={() => handleTrackJob(job, 'saved')}
                            disabled={isTracked}
                            className={`p-2 rounded-lg border transition ${
                              isTracked
                                ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan'
                                : 'border-white/10 text-brand-silver hover:bg-white/5'
                            }`}
                            title={isTracked ? 'Already tracked' : 'Save to pipeline'}
                          >
                            {isTracked ? (
                              <BookmarkCheck className="h-4 w-4" />
                            ) : (
                              <Bookmark className="h-4 w-4" />
                            )}
                          </button>

                          <button
                            onClick={() => handleMatchJob(job)}
                            disabled={isMatching || !!match}
                            className="flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 bg-white/5 border border-white/10 text-brand-silver hover:bg-brand-indigo/10 hover:border-brand-indigo/30 hover:text-brand-cyan disabled:opacity-40"
                          >
                            {isMatching ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Sparkles className="h-3 w-3" />
                            )}
                            {isMatching ? 'Matching...' : match ? 'Matched' : 'AI Match'}
                          </button>

                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              if (!isTracked) handleTrackJob(job, 'applied');
                              addActivityLog(`Opened application for ${job.title} at ${job.company}.`);
                            }}
                            className="flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 bg-brand-indigo hover:bg-brand-indigo/80 text-white shadow-[0_0_10px_rgba(63,78,255,0.25)]"
                          >
                            Apply
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <button
                    onClick={() => handleSearch(currentPage - 1)}
                    disabled={currentPage <= 1 || searchLoading}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-brand-silver hover:bg-white/10 disabled:opacity-30 transition"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </button>
                  <span className="text-xs text-brand-silver">
                    Page <span className="text-white font-bold">{currentPage}</span>
                  </span>
                  <button
                    onClick={() => handleSearch(currentPage + 1)}
                    disabled={!hasMore || searchLoading}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-brand-silver hover:bg-white/10 disabled:opacity-30 transition"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!searchLoading && searchResults.length === 0 && !searchError && (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="p-4 rounded-2xl bg-brand-indigo/10 border border-brand-indigo/20">
                  <Briefcase className="h-8 w-8 text-brand-indigo" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-white">Search for your next role</p>
                  <p className="text-xs text-brand-silver max-w-sm">
                    Enter a job title or keywords above to discover positions from real companies.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════ PIPELINE TAB ════════════════════════════════ */}
        {activeTab === 'pipeline' && (
          <div className="space-y-4">
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-brand-cyan" />
                  <h2 className="text-sm font-bold font-display text-white">
                    Application Tracking Pipeline
                  </h2>
                </div>
                <span className="text-[10px] text-brand-silver">
                  {trackedJobs.length} total tracked
                </span>
              </div>

              {trackedJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <BarChart3 className="h-8 w-8 text-brand-silver/30" />
                  <p className="text-xs text-brand-silver">
                    No tracked jobs yet. Save jobs from the Search tab to begin tracking.
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCorners}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2">
                    {PIPELINE_COLUMNS.map((col) => {
                      const columnJobs = trackedJobs.filter((tj) => tj.stage === col.id);
                      return (
                        <PipelineColumn
                          key={col.id}
                          column={col}
                          jobs={columnJobs}
                          onRemove={removeTrackedJob}
                        />
                      );
                    })}
                  </div>
                </DndContext>
              )}
            </GlassCard>

            {/* Pipeline Stats */}
            {trackedJobs.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {PIPELINE_COLUMNS.map((col) => {
                  const count = trackedJobs.filter((tj) => tj.stage === col.id).length;
                  return (
                    <GlassCard key={col.id} className="text-center !p-4">
                      <div
                        className="text-2xl font-extrabold font-display"
                        style={{ color: col.color }}
                      >
                        {count}
                      </div>
                      <div className="text-[9px] text-brand-silver uppercase tracking-wider mt-1">
                        {col.label}
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════ INSIGHTS TAB ════════════════════════════════ */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            {!insights && !insightsLoading && (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="p-4 rounded-2xl bg-brand-indigo/10 border border-brand-indigo/20">
                  <Lightbulb className="h-8 w-8 text-brand-cyan" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-bold text-white">
                    Generate AI Career Insights for "{userProfile.targetRole}"
                  </p>
                  <p className="text-xs text-brand-silver max-w-sm">
                    Get market analysis on in-demand skills, salary ranges, hiring trends, and
                    personalized recommendations.
                  </p>
                </div>
                <button
                  onClick={handleFetchInsights}
                  className="px-6 py-2.5 rounded-xl bg-brand-indigo hover:bg-brand-indigo/80 text-white font-bold text-xs transition shadow-[0_0_15px_rgba(63,78,255,0.3)] flex items-center gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate Insights
                </button>
              </div>
            )}

            {insightsLoading && (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="h-12 w-12 rounded-full border-4 border-white/5 border-t-brand-cyan animate-spin" />
                <p className="text-xs text-brand-silver">
                  AI is analyzing market data for {userProfile.targetRole}...
                </p>
              </div>
            )}

            {insights && !insightsLoading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* In-Demand Skills */}
                <GlassCard className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-brand-cyan" />
                    <h3 className="text-sm font-bold font-display text-white">In-Demand Skills</h3>
                  </div>
                  <div className="space-y-3">
                    {insights.inDemandSkills.map((skill, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-brand-border/20"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor:
                                skill.demandLevel === 'High'
                                  ? '#10B981'
                                  : skill.demandLevel === 'Medium'
                                  ? '#F59E0B'
                                  : '#A1A1AA',
                            }}
                          />
                          <span className="text-xs text-white font-medium">{skill.skill}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
                            style={{
                              borderColor:
                                skill.demandLevel === 'High'
                                  ? '#10B98140'
                                  : skill.demandLevel === 'Medium'
                                  ? '#F59E0B40'
                                  : '#A1A1AA40',
                              color:
                                skill.demandLevel === 'High'
                                  ? '#10B981'
                                  : skill.demandLevel === 'Medium'
                                  ? '#F59E0B'
                                  : '#A1A1AA',
                            }}
                          >
                            {skill.demandLevel}
                          </span>
                          <span className="text-[9px] text-brand-success font-mono">
                            {skill.growthTrend}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Salary Range */}
                <GlassCard className="space-y-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-brand-cyan" />
                    <h3 className="text-sm font-bold font-display text-white">
                      Salary Range ({insights.salaryRange.currency})
                    </h3>
                  </div>
                  <div className="space-y-6 pt-2">
                    <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          width: '100%',
                          background:
                            'linear-gradient(90deg, #EF4444 0%, #F59E0B 35%, #10B981 65%, #3F4EFF 100%)',
                          opacity: 0.6,
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {[
                        { label: 'Entry Level', value: insights.salaryRange.low, color: '#F59E0B' },
                        { label: 'Mid Level', value: insights.salaryRange.mid, color: '#10B981' },
                        { label: 'Senior Level', value: insights.salaryRange.high, color: '#3F4EFF' },
                      ].map((tier, i) => (
                        <div key={i} className="space-y-1">
                          <div className="text-lg font-extrabold font-display" style={{ color: tier.color }}>
                            {tier.value}
                          </div>
                          <div className="text-[9px] text-brand-silver uppercase tracking-wider">
                            {tier.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>

                {/* Hiring Trends */}
                <GlassCard className="space-y-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-brand-cyan" />
                    <h3 className="text-sm font-bold font-display text-white">Hiring Trends</h3>
                  </div>
                  <div className="space-y-3">
                    {insights.hiringTrends.map((trend, i) => (
                      <div key={i} className="flex gap-3 text-xs text-brand-silver leading-relaxed">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-indigo shrink-0" />
                        {trend}
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Recommendations */}
                <GlassCard className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-brand-cyan" />
                    <h3 className="text-sm font-bold font-display text-white">AI Recommendations</h3>
                  </div>
                  <div className="space-y-3">
                    {insights.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-3 rounded-lg bg-brand-indigo/5 border border-brand-indigo/10 text-xs text-brand-silver leading-relaxed"
                      >
                        <span className="text-brand-cyan font-bold shrink-0">{i + 1}.</span>
                        {rec}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleFetchInsights}
                    className="w-full py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-brand-silver hover:bg-white/10 transition flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-3 w-3" />
                    Regenerate Insights
                  </button>
                </GlassCard>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
