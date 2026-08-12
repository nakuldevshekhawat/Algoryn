import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { courseData, getProgress, togglePartCompletion, logActivity } from '../../data/dsStore';
import type { ProgressState } from '../../data/dsStore';
import { ArrowLeft, Play, Circle, CheckCircle2 } from 'lucide-react';

const getTelegramWebUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 't.me' || parsed.hostname === 'telegram.me') {
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length === 2) {
        const domain = parts[0];
        const post = parts[1];
        const tgaddr = encodeURIComponent(`tg://resolve?domain=${domain}&post=${post}`);
        return `https://web.telegram.org/a/#?tgaddr=${tgaddr}`;
      }
    }
  } catch (e) {
    // Return original url if parsing fails
  }
  return url;
};

export const Lecture = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const lecture = courseData.lectures.find((l: any) => l.id.toString() === id);
  const [progress, setProgress] = useState<ProgressState>({});

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  if (!lecture) {
    return (
      <div className="py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-text-main mb-4">Lecture Not Found</h2>
        <p className="text-text-muted mb-8 text-lg">The lecture you are looking for does not exist or has been removed.</p>
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary-dark font-bold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
      </div>
    );
  }

  const handleTogglePart = (partNum: number) => {
    const newProgress = togglePartCompletion(lecture.id, partNum);
    setProgress({ ...newProgress });
  };

  const handleWatch = (partNum: number) => {
    logActivity(lecture.id, partNum);
  };

  const completedParts = progress[lecture.id] || [];
  const totalParts = lecture.videos.length;
  const lectureProgress = totalParts === 0 ? 0 : Math.round((completedParts.length / totalParts) * 100);

  return (
    <div className="w-full pb-16">
      
      {/* Navigation */}
      <Link 
        to="/data-science/lectures" 
        className="inline-flex items-center gap-2 text-text-muted hover:text-text-main text-[15px] mb-8 transition-colors group font-semibold"
      >
        <div className="w-9 h-9 rounded-full bg-white border border-border-subtle flex items-center justify-center group-hover:border-border-normal shadow-softer transition-all">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        </div>
        Back to Lectures
      </Link>

      {/* Header */}
      <header className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-main mb-3 leading-tight">
          {lecture.title}
        </h1>
        <div className="mb-8">
          <span className="text-[14px] font-bold px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full inline-block">
            {totalParts} {totalParts === 1 ? 'part' : 'parts'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl">
          <div className="flex items-end justify-between mb-3">
            <span className="text-[15px] font-semibold text-text-muted uppercase tracking-wider">Overall Lecture Progress</span>
            <span className="text-[15px] font-bold text-text-main">{completedParts.length} / {totalParts} parts completed</span>
          </div>
          <div className="h-2.5 w-full bg-border-subtle rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-primary rounded-full transition-all duration-500"
              style={{ width: `${lectureProgress}%` }}
            />
          </div>
        </div>
      </header>

      <hr className="border-border-subtle mb-10" />

      {/* Video Parts */}
      <section className="space-y-4 max-w-4xl">
        {lecture.videos.map((video: any) => {
          const isPartComplete = completedParts.includes(video.part);
          const partNumFormatted = video.part.toString().padStart(2, '0');
          
          return (
            <div 
              key={video.part}
              className={`
                bg-white border rounded-[20px] p-5 sm:p-6 transition-all shadow-softer hover:shadow-soft
                ${isPartComplete ? 'border-brand-primary/20 bg-brand-primary-light/5' : 'border-border-subtle'}
              `}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                   <div className={`
                     w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors
                     ${isPartComplete ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-500'}
                   `}>
                     {partNumFormatted}
                   </div>
                   <h3 className={`font-bold text-[17px] sm:text-lg ${isPartComplete ? 'text-text-muted' : 'text-text-main'}`}>
                     Part {video.part}
                   </h3>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 self-start sm:self-auto">
                  <a 
                    href={getTelegramWebUrl(video.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleWatch(video.part)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-text-main rounded-xl text-[14px] sm:text-[15px] font-bold transition-colors border border-gray-200 shadow-sm"
                  >
                    <Play className="w-4 h-4" />
                    Watch &rarr;
                  </a>

                  <button
                    onClick={() => handleTogglePart(video.part)}
                    className="inline-flex items-center gap-2 text-[14px] font-bold transition-colors group px-2"
                  >
                    {isPartComplete ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-brand-primary" />
                        <span className="text-brand-primary">Completed</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-5 h-5 text-gray-300 group-hover:text-brand-primary/50 transition-colors" />
                        <span className="text-gray-400 group-hover:text-theme-text transition-colors">Completed</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

    </div>
  );
};
