import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Briefcase, Users, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ConsultantProfile {
  name: string;
  title: string;
  bio: string;
  expertise: string[];
  services: string[];
  yearsOfExperience: number;
  languages: string[];
  availability: string;
}

export function ConsultantProfile() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["consultant-profile"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/consultant/profile");
      return res.json() as Promise<ConsultantProfile>;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  if (isLoading) {
    return (
      <div className="px-6 md:px-8 py-6 border-b border-border/40 bg-gradient-to-br from-primary/5 to-chart-1/5">
        <div className="max-w-3xl mx-auto space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="px-6 md:px-8 py-6 border-b border-border/40 bg-gradient-to-br from-primary/5 to-chart-1/5">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Name and Title */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
          <p className="text-sm font-medium text-primary">{profile.title}</p>
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Experience</p>
              <p className="text-sm font-semibold">{profile.yearsOfExperience}+ years</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Services</p>
              <p className="text-sm font-semibold">{profile.services.length} offered</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Languages</p>
              <p className="text-sm font-semibold">{profile.languages.length}</p>
            </div>
          </div>
        </div>

        {/* Expertise Tags */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Expertise
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.expertise.slice(0, 5).map((exp) => (
              <span
                key={exp}
                className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
              >
                {exp}
              </span>
            ))}
            {profile.expertise.length > 5 && (
              <span className="inline-block px-3 py-1 text-xs font-medium text-muted-foreground">
                +{profile.expertise.length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Availability */}
        <p className="text-xs text-muted-foreground pt-2">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 align-middle"></span>
          {profile.availability}
        </p>
      </div>
    </div>
  );
}
