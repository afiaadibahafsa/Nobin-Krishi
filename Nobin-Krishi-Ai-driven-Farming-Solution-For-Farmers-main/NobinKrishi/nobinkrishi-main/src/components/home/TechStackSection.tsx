import { Eye, Camera, Layers, Globe, Satellite, Map, Brain, Cpu, Zap, Database, Cloud, Shield } from 'lucide-react';

const techCategories = [
  {
    title: 'Computer Vision',
    icons: [Eye, Camera, Layers],
    technologies: [
      'Dhenu Llama 3 8B',
      'Dhenu-vision-lora-0.1',
      'TensorFlow & PyTorch',
      'AWS Rekognition',
    ],
  },
  {
    title: 'Geospatial Intelligence',
    icons: [Globe, Satellite, Map],
    technologies: [
      'Google Earth Engine',
      'Sentinel-2 Satellite',
      'NASA SERVIR',
      'OpenWeatherMap API',
    ],
  },
  {
    title: 'AI & Machine Learning',
    icons: [Brain, Cpu, Zap],
    technologies: [
      'LLaMA 3 Fine-tuned',
      'RAG Pipelines',
      'AutoML',
      'LangChain',
    ],
  },
  {
    title: 'Data & Infrastructure',
    icons: [Database, Cloud, Shield],
    technologies: [
      'PostgreSQL',
      'Docker Microservices',
      'AWS/GCP/Azure',
      'Edge Computing',
    ],
  },
];

export function TechStackSection() {
  return (
    <section className="section-padding bg-sidebar-dark">
      <div className="container-max px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="heading-section text-white">
            Built on Cutting-Edge AI Technology
          </h2>
          <p className="text-white/80 mt-4 max-w-2xl mx-auto text-lg">
            Enterprise-grade infrastructure powering intelligent agriculture
          </p>
        </div>

        {/* Tech Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {techCategories.map((category) => (
            <div
              key={category.title}
              className="tech-card hover:scale-[1.02] transition-all duration-300"
            >
              {/* Icons */}
              <div className="flex gap-3 mb-6">
                {category.icons.map((Icon, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center"
                  >
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                ))}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-4">
                {category.title}
              </h3>

              {/* Technologies */}
              <ul className="space-y-2">
                {category.technologies.map((tech) => (
                  <li
                    key={tech}
                    className="text-white/70 text-sm flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
