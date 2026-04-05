import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Zap, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { setAuthSession, type AuthSession } from "@/lib/auth";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  terms: z.boolean().refine((val) => val === true, "You must accept the terms"),
});

const passwordRequirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
];

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; terms?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = signupSchema.safeParse({ name, email, password, terms: acceptTerms });
    if (!result.success) {
      const fieldErrors: { name?: string; email?: string; password?: string; terms?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (field === "name") fieldErrors.name = err.message;
        if (field === "email") fieldErrors.email = err.message;
        if (field === "password") fieldErrors.password = err.message;
        if (field === "terms") fieldErrors.terms = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const data = await api.post<AuthSession>("/api/auth/signup", {
        name,
        email,
        password,
      });

      setAuthSession(data);

      toast({
        title: "Welcome to X-Ops!",
        description: "Your account has been created successfully.",
      });

      navigate(data.user.role === "admin" ? "/admin" : "/");
    } catch (error) {
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background tech-grid">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-card/50 border-r border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-30" />
        <div className="relative z-10 text-center p-12">
          <div className="text-8xl mb-8">🎯</div>
          <h2 className="text-2xl font-bold mb-4">
            Start Your <span className="text-gradient">Journey</span>
          </h2>
          <p className="text-muted-foreground max-w-md">
            Join thousands of developers learning, building, and growing together 
            in the X-Ops community.
          </p>
          
          <div className="mt-12 space-y-4 text-left max-w-sm mx-auto">
            {[
              "Access to exclusive workshops",
              "Network with industry professionals",
              "Participate in hackathons",
              "Build real-world projects",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="p-1 rounded-full bg-primary/20">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">


          <h1 className="text-3xl font-bold mb-2">Create an account</h1>
          <p className="text-muted-foreground mb-8">
            Join X-Ops and start your tech journey today
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`bg-card ${errors.name ? "border-destructive" : ""}`}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`bg-card ${errors.email ? "border-destructive" : ""}`}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`bg-card pr-10 ${errors.password ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password requirements */}
              <div className="space-y-1.5 pt-2">
                {passwordRequirements.map((req) => (
                  <div key={req.label} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-1.5 w-1.5 rounded-full transition-colors",
                        req.test(password) ? "bg-primary" : "bg-muted-foreground/50"
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs transition-colors",
                        req.test(password) ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground font-normal leading-relaxed">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              {errors.terms && (
                <p className="text-sm text-destructive">{errors.terms}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
