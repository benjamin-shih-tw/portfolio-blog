import { getSortedProjectsData } from '@/lib/markdown';
import PortfolioFilter from '@/components/PortfolioFilter';
import home from '../../public/home.json';

export default function Home() {
  const allProjects = getSortedProjectsData();
  const localProjects = allProjects.filter(p => p.type !== 'project');
  const githubProjects = allProjects.filter(p => p.type === 'project');

  return (
    <main className="container">
      <header className="header">
        <h1>{home.titleBefore}{' '}<span className="accent-red">{home.titleAccent}</span>,<br/>{home.titleAfter}</h1>
        <p>{home.description}</p>
        <div className="sticky-note">
          <h2>{home.stickyTitle}</h2>
          <p>{home.stickyDescription}</p>
        </div>
      </header>
      <PortfolioFilter localProjects={localProjects} githubProjects={githubProjects} />
    </main>
  );
}
