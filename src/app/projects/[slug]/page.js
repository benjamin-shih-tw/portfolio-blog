import { getProjectData, getAllProjectSlugs } from '@/lib/markdown';
import Link from 'next/link';

export async function generateStaticParams() {
  const slugs = getAllProjectSlugs();
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

export default async function Project({ params }) {
  const resolvedParams = await params;
  const projectData = await getProjectData(resolvedParams.slug);
  
  return (
    <main className="container">
      <Link href="/" className="back-link">← Back to Notebook</Link>
      <article className="project-container">
        <h1>{projectData.title}</h1>
        <div className="project-meta">{projectData.date}</div>
        <div 
          className="project-content"
          dangerouslySetInnerHTML={{ __html: projectData.contentHtml }} 
        />
        {projectData.type === 'project' && projectData.link && (
          <div className="project-link-wrapper">
            <a href={projectData.link} target="_blank" rel="noopener noreferrer" className="external-link-btn">
              Visit Project ↗
            </a>
          </div>
        )}
      </article>
    </main>
  );
}
