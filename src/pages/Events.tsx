import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, Users, ArrowRight, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type EventType = "all" | "workshop" | "hackathon" | "bootcamp" | "meetup" | "webinar";

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: EventType;
  attendees: number;
  maxAttendees: number;
  image: string;
  featured?: boolean;
  joinLink?: string;
  linkLabel?: string;
  spotsLabel?: string;
  registrationClosed?: boolean;
  hideDate?: boolean;
  hideAttendees?: boolean;
  speaker?: string;
  moreInfo?: string;
}

const events: Event[] = [
  {
    id: 1,
    title: "🚀 GET FREE ORACLE & MICROSOFT CERTIFICATIONS! 🚀",
    description:
      "🚀 GET FREE ORACLE & MICROSOFT CERTIFICATIONS! 🚀\n\nA FREE E-Certificate of Participation will be provided to all attendees.",
    moreInfo:
      `Calling all Computer Science & Engineering students! Want to instantly boost your resume and gain a serious edge in the job market?\n\nJAIN (Deemed-to-be University)'s Dept. of CSE (AI-Driven DevOps) and the X-Ops Club invite you to a must-attend session:\n\n✨ Oracle and Microsoft Free Certification Opportunities for Students: Tips, Guidance, and Career Pathways ✨\n\nJoin us to hear from Dr. Rajesh Bingu Ph.D.—a Global Certification Mentor—who will reveal exactly how you can acquire valuable, industry-recognized Oracle and Microsoft certifications at absolutely NO cost!\n\nWhat You'll Gain:\n- Actionable Tips on the free certification process.\n- Expert Guidance to fast-track your career.\n- Understanding of the clear career pathways these credentials open.\n\nDon't miss this chance to invest in your future!`,
    date: "17-10-2025 (Friday)",
    time: "07.00 PM",
    location: "Online (Google Meet)",
    type: "workshop",
    attendees: 0,
    maxAttendees: 500,
    image: "🎓",
    featured: true,
    joinLink: "https://meet.google.com/bvp-cytn-iwj",
    registrationClosed: true,
    speaker: "Dr. Rajesh Bingu Ph.D.",
  },
  {
    id: 2,
    title: "Chaos or Release",
    description:
      "A fun, non-technical decision-making game where teams tackle real-world scenarios and race to prevent system failures.",
    moreInfo:
      "Hello everyone! We are from the XOps Club.\n\nThe XOps Club presents 'Chaos or Release,' held on 25 March 2026 in Seminar Hall 002.\n\nNo coding experience is needed. This is a fun decision-making game, not a technical one.\n\nTeam size: 3 members per team.\n\nYou will be given real-world scenario-based questions, and your team must decide within the allotted time.\n\nEarn the most points by making smart choices to avoid system failures!",
    date: "March 25, 2026 (Wednesday)",
    time: "TBA",
    location: "Seminar Hall 002",
    type: "meetup",
    attendees: 0,
    maxAttendees: 120,
    image: "🎯",
    featured: true,
    joinLink: "https://chaos-or-release-v2-production.up.railway.app/",
    linkLabel: "chaos-or-release",
    spotsLabel: "20+team spots",
    registrationClosed: true,
  },
  {
    id: 4,
    title: "Industry Webinar: RPA Career Insights",
    description:
      "A webinar session with Ms. Praneetha K on RPA career pathways and real-world industry experience.",
    moreInfo:
      "Speaker: Ms. Praneetha K\nLead RPA Developer\nJohnson & Johnson, New Brunswick, New Jersey, USA.",
    date: "April 7, 2026 (Tuesday)",
    time: "9:00 AM",
    location: "LH201",
    type: "webinar",
    attendees: 0,
    maxAttendees: 100,
    image: "🎙️",
  },
];

const eventTypes: { value: EventType; label: string }[] = [
  { value: "all", label: "All Events" },
  { value: "workshop", label: "Workshops" },
  { value: "hackathon", label: "Hackathons" },
  { value: "bootcamp", label: "Bootcamps" },
  { value: "meetup", label: "Meetups" },
  { value: "webinar", label: "Webinars" },
];


import Layout from "@/components/layout/Layout";


const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<EventType>("all");

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || event.type === selectedType;
    return matchesSearch && matchesType;
  });

  const featuredEvents = filteredEvents.filter((e) => e.featured);
  const regularEvents = filteredEvents.filter((e) => !e.featured);

  return (
    <Layout>
      {/* Header */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Upcoming <span className="text-gradient">Events</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Join our workshops, hackathons, and meetups to level up your skills 
              and connect with fellow tech enthusiasts.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              {eventTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    selectedType === type.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <span className="text-primary">★</span> Featured Events
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="gradient-border p-8 card-hover animate-fade-in-up relative"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{event.image}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium capitalize">
                          {event.type}
                        </span>
                        <span className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
                          Featured
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{event.description}</p>
                      {event.speaker && (
                        <div className="mb-2 text-sm font-medium text-primary">
                          Speaker: {event.speaker}
                        </div>
                      )}
                      {event.joinLink && (
                        <div className="mb-2 text-sm">
                          <a href={event.joinLink} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">{event.linkLabel ?? "Join Link"}</a>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          {event.date}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          {event.spotsLabel ?? `${event.attendees}/${event.maxAttendees} spots`}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {event.registrationClosed ? (
                          <Button variant="default" className="flex-1 bg-gray-400 cursor-not-allowed text-white font-bold" disabled>
                            Registration Closed
                          </Button>
                        ) : event.joinLink ? (
                          <Button asChild variant="hero" className="flex-1">
                            <a href={event.joinLink} target="_blank" rel="noopener noreferrer">
                              Register Now
                            </a>
                          </Button>
                        ) : (
                          <Button variant="hero" className="flex-1" disabled>
                            Registration Opening Soon
                          </Button>
                        )}
                        {event.moreInfo && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="flex-1">Know More</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Event Details</DialogTitle>
                                <DialogDescription>
                                  <pre className="whitespace-pre-wrap text-left font-sans">{event.moreInfo}</pre>
                                </DialogDescription>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Events */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">All Events</h2>
          
          {regularEvents.length === 0 ? (
            <div className="text-center py-16">
              <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No events found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="glass rounded-xl overflow-hidden card-hover animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-4xl">{event.image}</span>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">
                        {event.type}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    {event.speaker && (
                      <div className="mb-2 text-sm font-medium text-primary">
                        Speaker: {event.speaker}
                      </div>
                    )}
                    {event.joinLink && (
                      <div className="mb-2 text-sm">
                        <a href={event.joinLink} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">{event.linkLabel ?? "Join Link"}</a>
                      </div>
                    )}
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      {!event.hideDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          {event.date}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {event.location}
                      </div>
                      {!event.hideAttendees && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          {event.attendees}/{event.maxAttendees} attending
                        </div>
                      )}
                    </div>

                    {/* Progress bar for spots */}
                    {!event.hideAttendees && (
                      <div className="mb-4">
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {event.registrationClosed ? (
                        <Button variant="default" className="flex-1 bg-gray-400 cursor-not-allowed text-white font-bold" disabled>
                          Registration Closed
                        </Button>
                      ) : event.joinLink ? (
                        <Button asChild variant="hero-outline" className="flex-1">
                          <a href={event.joinLink} target="_blank" rel="noopener noreferrer">
                            Register
                          </a>
                        </Button>
                      ) : (
                        <Button variant="hero-outline" className="flex-1" disabled>
                          Registration Opening Soon
                        </Button>
                      )}
                      {event.moreInfo && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="flex-1">Know More</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Event Details</DialogTitle>
                              <DialogDescription>
                                <pre className="whitespace-pre-wrap text-left font-sans">{event.moreInfo}</pre>
                              </DialogDescription>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Events;
