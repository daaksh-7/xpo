import { Target, Lightbulb, Users, Heart, Github, Linkedin, Twitter } from "lucide-react";
import Layout from "@/components/layout/Layout";

const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We push boundaries and explore emerging technologies to stay ahead of the curve.",
  },
  {
    icon: Users,
    title: "Community",
    description: "We believe in the power of collaboration and supporting each other's growth.",
  },
  {
    icon: Target,
    title: "Excellence",
    description: "We strive for quality in everything we do, from events to projects.",
  },
  {
    icon: Heart,
    title: "Inclusivity",
    description: "We welcome everyone, regardless of skill level or background.",
  },
];

const teamMembers = [
  {
    name: "Alex Chen",
    role: "President",
    bio: "Full-stack developer passionate about AI and open source.",
    avatar: "👨‍💻",
    socials: { github: "#", linkedin: "#", twitter: "#" },
  },
  {
    name: "Sarah Johnson",
    role: "Vice President",
    bio: "Cloud architect with a love for DevOps and automation.",
    avatar: "👩‍💻",
    socials: { github: "#", linkedin: "#", twitter: "#" },
  },
  {
    name: "Mike Williams",
    role: "Tech Lead",
    bio: "Systems engineer focused on cybersecurity and blockchain.",
    avatar: "🧑‍💻",
    socials: { github: "#", linkedin: "#", twitter: "#" },
  },
  {
    name: "Emily Davis",
    role: "Events Coordinator",
    bio: "Project manager who brings people together through amazing events.",
    avatar: "👩‍🎨",
    socials: { github: "#", linkedin: "#", twitter: "#" },
  },
  {
    name: "James Lee",
    role: "Workshop Lead",
    bio: "Educator at heart, specializing in web development training.",
    avatar: "👨‍🏫",
    socials: { github: "#", linkedin: "#", twitter: "#" },
  },
  {
    name: "Lisa Wang",
    role: "Community Manager",
    bio: "Building connections and fostering an inclusive tech community.",
    avatar: "👩‍🚀",
    socials: { github: "#", linkedin: "#", twitter: "#" },
  },
];

const milestones = [
  { year: "2020", title: "Founded", description: "X-Ops was born with just 12 founding members." },
  { year: "2021", title: "First Hackathon", description: "Hosted our first hackathon with 100+ participants." },
  { year: "2022", title: "500 Members", description: "Reached 500 active members milestone." },
  { year: "2023", title: "Industry Partners", description: "Partnered with 10+ tech companies for workshops." },
  { year: "2024", title: "Virtual Expansion", description: "Launched online events reaching global audience." },
  { year: "2025", title: "Innovation Lab", description: "Opened our first dedicated innovation lab space." },
];

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About <span className="text-gradient">X-Ops</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              We're a community of passionate developers, designers, and tech enthusiasts 
              dedicated to learning, building, and innovating together.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our <span className="text-gradient">Mission</span>
              </h2>
              <p className="text-muted-foreground mb-4">
                X-Ops exists to empower the next generation of tech innovators. We believe 
                that everyone should have access to quality tech education and a supportive 
                community to grow with.
              </p>
              <p className="text-muted-foreground mb-4">
                Through hands-on workshops, hackathons, and networking events, we provide 
                our members with the skills, connections, and opportunities they need to 
                succeed in the ever-evolving tech industry.
              </p>
              <p className="text-muted-foreground">
                Whether you're a complete beginner or a seasoned professional, there's a 
                place for you at X-Ops. Join us and be part of something bigger.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {values.map((value, index) => (
                <div
                  key={value.title}
                  className="glass p-6 rounded-xl card-hover animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                    <value.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our <span className="text-gradient">Journey</span>
            </h2>
            <p className="text-muted-foreground">
              From humble beginnings to a thriving community.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden md:block" />
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`flex items-center gap-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  } animate-fade-in-up`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <div className="glass p-6 rounded-xl inline-block">
                      <span className="text-primary font-mono font-bold">{milestone.year}</span>
                      <h3 className="font-semibold mt-1">{milestone.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                    </div>
                  </div>
                  
                  {/* Center dot */}
                  <div className="hidden md:flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-primary glow-primary" />
                  </div>
                  
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Meet the <span className="text-gradient">Team</span>
            </h2>
            <p className="text-muted-foreground">
              The passionate individuals behind X-Ops who make it all happen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <div
                key={member.name}
                className="gradient-border p-6 text-center card-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-6xl mb-4">{member.avatar}</div>
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-primary text-sm font-medium mb-2">{member.role}</p>
                <p className="text-muted-foreground text-sm mb-4">{member.bio}</p>
                
                <div className="flex items-center justify-center gap-4">
                  <a
                    href={member.socials.github}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={`${member.name}'s GitHub`}
                  >
                    <Github className="h-4 w-4" />
                  </a>
                  <a
                    href={member.socials.linkedin}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={`${member.name}'s LinkedIn`}
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a
                    href={member.socials.twitter}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={`${member.name}'s Twitter`}
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
