import { Target, Lightbulb, Users, Heart, Github, Linkedin, Twitter } from "lucide-react";
import Layout from "@/components/layout/Layout";

const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "JU-FET and XOps Club foster innovation by providing hands-on learning, state-of-the-art labs, and opportunities to master the latest technologies through real projects and hackathons.",
  },
  {
    icon: Target,
    title: "Excellence",
    description: "Driven by visionary leadership and expert faculty, we focus on holistic student growth, world-class education, and a culture of excellence that prepares members for global tech success.",
  },
  {
    icon: Heart,
    title: "Inclusivity",
    description: "We welcome everyone, regardless of skill level or background, and encourage participation in co-curricular and extra-curricular activities.",
  },
];

// Our Mission section (short)
const missionPoints = [
  "Deliver world-class, industry-relevant education and practical skills for a smooth transition from academics to industry.",
  "Empower students to excel in AI, DevOps, and automation through hands-on challenges and mentorship.",
  "Promote a dynamic, innovative environment that values teamwork, leadership, and continuous learning."
];

const teamMembers = [
  {
    name: "Shreyas S",
    role: "Club Lead",
    bio: "Leading the shift to autonomous DevOps.",
    avatar: "👨",
    socials: { linkedin: "https://www.linkedin.com/in/shreyas-s-357056327?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
  },
  {
    name: "Lakshitha A",
    role: "Club Co-Lead",
    bio: "Accelerating team growth and AI integration.",
    avatar: "👩",
    socials: { linkedin: "https://www.linkedin.com/in/lakshitha-a-b16090330?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
  },
  {
    name: "Saksham Singh",
    role: "Technical Lead",
    bio: "Debugging the future with AI-enhanced workflows.",
    avatar: "🧑‍💻",
    socials: { linkedin: "https://www.linkedin.com/in/saksham-singh-94658b322/" },
  },
  {
    name: "Thulasi Sri Nidhi",
    role: "Technical Co-Lead",
    bio: "Building the pipelines that power the club.",
    avatar: "👩‍💻",
    socials: { linkedin: "https://www.linkedin.com/in/thulasi-sri-nidhi-ba17a3382?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
  },
  {
    name: "Thavanidhi V P",
    role: "Event & Outreach Lead",
    bio: "Bridging the gap between AI tech and the student community.",
    avatar: "👩",
    socials: { linkedin: "https://www.linkedin.com/in/thavanidhi-v-p-1a797136a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" },
  },
  {
    name: "Sujay V",
    role: "Event & Outreach Co-Lead",
    bio: "Expanding the ecosystem for the next gen of DevOps.",
    avatar: "🧑",
    socials: { linkedin: "https://www.linkedin.com/in/sujayv26?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
  },
  {
    name: "Aniruddh V N",
    role: "Treasurer",
    bio: "Managing resources for a high-performance tech future.",
    avatar: "🧑",
    socials: { linkedin: "https://www.linkedin.com/in/aniruddh-v-n-5b7124340?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
  },
  {
    name: "Divyashree M",
    role: "Co-Treasurer",
    bio: "Financial operations for sustainable tech growth.",
    avatar: "👩",
    socials: { linkedin: "https://www.linkedin.com/in/divyashree-m-11a334326?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
  },
];

const milestones = [
    {
      year: "JU-FET",
      title: "JAIN (Deemed-to-be University), Faculty of Engineering & Technology",
      description:
        "JU-FET is a top Bengaluru engineering institute, offering practical, industry-focused UG and PG programs.",
    },
    {
      year: "CSE Dept.",
      title: "Department of Computer Science and Engineering",
      description:
        "CSE drives innovation and research, preparing students for global tech careers with hands-on learning.",
    },
    {
      year: "XOps Club",
      title: "XOps Club at JU-FET",
      description:
        "XOps Club empowers students in AI and DevOps through real-world projects, hackathons, and teamwork.",
    },
    {
      year: "Vision",
      title: "Leadership & Culture of Excellence",
      description:
        "JU-FET and XOps Club promote innovation, teamwork, and excellence for global tech success.",
    },
    {
      year: "Mission",
      title: "Driving Automation & Innovation",
      description:
        "XOps Club advances automation, teamwork, and innovation—delivering real tech impact through DevOps, XOps, and strong mentorship.",
    },
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
              X-Ops Club is a student-led community at JU-FET dedicated to advancing DevOps, AI, and automation through hands-on learning, collaboration, and innovation.
            </p>
          </div>
        </div>
      </section>

      {/* Mentorship Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-3">
              <span className="font-semibold text-primary">Acknowledging Our Mentors</span>
            </div>
            <div className="mb-2">
              <h3 className="text-xl font-bold mb-1">Dr. J. Somaesekar</h3>
              <p className="text-muted-foreground text-sm">
                Program Head &mdash; guiding X-Ops Club with strategic vision, academic leadership, and unwavering support.
              </p>
            </div>
            <div className="mb-2">
              <h3 className="text-lg font-semibold mb-1">Prof. Vaibhav Prabhakar Raibole</h3>
              <p className="text-muted-foreground text-sm">
                Club Coordinator &mdash; providing mentorship, insight, and encouragement for the club’s growth and success.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Dr. S Prakash</h3>
              <p className="text-muted-foreground text-sm">
                Training & Placement Coordinator &mdash; supporting student participation and discipline through guidance and motivation.
              </p>
            </div>
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
                <div className="mb-2">
                  {/* Removed 'The X-Ops Club' text above social links */}
                </div>
                <div className="flex items-center justify-center gap-4">
                  {member.socials.github && (
                    <a
                      href={member.socials.github}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label={`${member.name}'s GitHub`}
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                  {member.socials.linkedin && (
                    <a
                      href={member.socials.linkedin}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label={`${member.name}'s LinkedIn`}
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {member.socials.twitter && (
                    <a
                      href={member.socials.twitter}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label={`${member.name}'s Twitter`}
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                  )}
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
