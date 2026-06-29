'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PortfolioFilter({ localProjects, githubProjects }) {
  const [activeTab, setActiveTab] = useState('blog');

  // 統一的卡片渲染函式
  const renderCards = (projects, emptyMessage) => {
    if (projects.length === 0) {
      return <p>{emptyMessage}</p>;
    }
    
    return projects.map(({ slug, title, date, description }) => (
      <Link href={`/projects/${slug}`} key={slug} className="card">
        <div className="card-header">
          <div className="icon-box blue">📝</div>
          <div className="tag pink">{date}</div>
        </div>
        <h3>{title}</h3>
        <div className="description">{description}</div>
        <div className="tag-container">
          <span className="tag">Read More</span>
        </div>
      </Link>
    ));
  };

  return (
    <div>
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'blog' ? 'active' : ''}`}
          onClick={() => setActiveTab('blog')}
        >
          Blog / Notes
        </button>
        <button 
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          GitHub Projects
        </button>
      </div>

      {activeTab === 'blog' && (
        <section className="projects-section">
          <div className="grid">
            {renderCards(localProjects, "No notes found. Add markdown files to src/data/projects!")}
          </div>
        </section>
      )}

      {activeTab === 'projects' && (
        <section className="projects-section">
          <div className="grid">
            {renderCards(githubProjects, "No projects found. Add markdown files with type: 'project'!")}
          </div>
        </section>
      )}
    </div>
  );
}
