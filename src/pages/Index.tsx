import { Link } from "react-router-dom";
import { ArrowRight, Code2, Users, Calendar, Sparkles, Terminal, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  {
    icon: Code2,
    title: "Workshops & Bootcamps",
    description: "Learn cutting-edge technologies from industry experts through hands-on workshops.",
  },
  {
    icon: Users,
    title: "Community Network",
    description: "Connect with like-minded developers and build lasting professional relationships.",
  },
  {
    icon: Calendar,
    title: "Hackathons & Events",
    description: "Participate in exciting hackathons and compete for amazing prizes.",
  },
];

const upcomingEvents = [
  {
    title: "AI/ML Workshop",
    date: "Feb 15, 2026",
    type: "Workshop",
  },
  {
    title: "Spring Hackathon",
    date: "Mar 1-2, 2026",
    type: "Hackathon",
  },
  {
    title: "Cloud Computing 101",
    date: "Mar 20, 2026",
    type: "Bootcamp",
  },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 opacity-20 float">
          <Terminal className="h-16 w-16 text-primary" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20 float" style={{ animationDelay: "2s" }}>
          <Cpu className="h-20 w-20 text-accent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              <span>Welcome to the Future of Tech</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up">
              <span className="text-foreground">Build. Learn. </span>
              <span className="text-gradient">Innovate.</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-1">
              Join X-Ops, the premier tech club where developers, designers, and innovators 
              come together to shape the future of technology.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-2">
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">
                  Join X-Ops Today
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/events">Explore Events</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-border/50 animate-fade-in-up stagger-3">
              {[
                { value: "500+", label: "Members" },
                { value: "50+", label: "Events Hosted" },
                { value: "20+", label: "Partners" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Join <span className="text-gradient">X-Ops?</span>
            </h2>
            <p className="text-muted-foreground">
              We provide everything you need to accelerate your tech journey and build real-world skills.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="gradient-border p-8 card-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-6">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Upcoming <span className="text-gradient">Events</span>
              </h2>
              <p className="text-muted-foreground">
                Don't miss out on our exciting upcoming events and workshops.
              </p>
            </div>
            <Button variant="hero-outline" asChild className="mt-6 md:mt-0">
              <Link to="/events">
                View All Events
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <div
                key={event.title}
                className="glass rounded-xl p-6 card-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                  {event.type}
                </div>
                <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                <p className="text-muted-foreground text-sm">{event.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="gradient-border p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your <span className="text-gradient">Tech Journey?</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Join our community of 500+ members and get access to exclusive events, 
              workshops, and networking opportunities.
            </p>
            <Button variant="gradient" size="xl" asChild>
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
