import ToolCard from '../components/ToolCard'
import { TOOL_LINKS } from '../utils/routes'

function HomePage() {
  const featuredTools = TOOL_LINKS

  return (
    <section className="page-enter">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {featuredTools.map((tool) => (
          <ToolCard key={tool.path} title={tool.title} description={tool.summary} icon={tool.icon} route={tool.path} />
        ))}
      </div>
    </section>
  )
}

export default HomePage
