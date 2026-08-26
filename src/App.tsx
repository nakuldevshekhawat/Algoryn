import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { migrateInterviewXProgress } from './utils/migrateInterviewXProgress';
import { Layout } from './layout/Layout';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { Progress } from './pages/Progress';
import { Calendar } from './pages/Calendar';

// DSA Pages
import Roadmap from './pages/dsa/Roadmap';
import Problems from './pages/dsa/Problems';
import ProblemDetail from './pages/dsa/ProblemDetail';
import Revision from './pages/dsa/Revision';
import Favorites from './pages/dsa/Favorites';
import Notes from './pages/dsa/Notes';
import Statistics from './pages/dsa/Statistics';
import Settings from './pages/dsa/Settings';

// InterviewX Pages
import InterviewX from './pages/interviewX/InterviewX';
import InterviewXSubject from './pages/interviewX/InterviewXSubject';

// Data Science Pages
import { Lectures } from './pages/data-science/Lectures';
import { Lecture } from './pages/data-science/Lecture';

import { ModeProvider } from './contexts/ModeContext';
import { ThemeProvider } from './contexts/ThemeContext';
migrateInterviewXProgress();

function App() {
  return (
    <Router>
      <ThemeProvider>
        <ModeProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/calendar" element={<Calendar />} />

              {/* DSA Routes */}
              <Route path="/dsa" element={<Navigate to="/dsa/roadmap" replace />} />
              <Route path="/dsa/roadmap" element={<Roadmap />} />
              <Route path="/dsa/problems" element={<Problems />} />
              <Route path="/dsa/problems/:id" element={<ProblemDetail />} />
              <Route path="/dsa/revision" element={<Revision />} />
              <Route path="/dsa/favorites" element={<Favorites />} />
              <Route path="/dsa/notes" element={<Notes />} />
              <Route path="/dsa/statistics" element={<Statistics />} />
              <Route path="/dsa/settings" element={<Settings />} />

              {/* InterviewX Routes */}
              <Route path="/interviewX" element={<InterviewX />} />
              <Route path="/interviewX/:subject" element={<InterviewXSubject />} />

              {/* Data Science Routes */}
              <Route path="/data-science" element={<Navigate to="/data-science/lectures" replace />} />
              <Route path="/data-science/lectures" element={<Lectures />} />
              <Route path="/data-science/lectures/:id" element={<Lecture />} />
            </Routes>
          </Layout>
        </ModeProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
