import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center animate-fade-in px-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-brand-primary/20 blur-[50px] rounded-full" />
          <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-text-primary to-text-muted relative z-10 font-mono tracking-tighter">
            404
          </h1>
        </div>
        
        <h2 className="mb-4 text-2xl font-bold text-text-primary">
          Page Not Found
        </h2>
        
        <p className="mb-8 text-sm text-text-secondary">
          The page you're looking for doesn't exist, has been moved, or you don't have access to it.
        </p>
        
        <div className="flex flex-col gap-3 sm:flex-row w-full sm:w-auto">
          <Button 
            variant="primary" 
            onClick={() => navigate("/")}
            className="w-full sm:w-auto px-8"
          >
            Back to Dashboard
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => navigate("/problems")}
            className="w-full sm:w-auto px-8"
          >
            Browse Problems
          </Button>
        </div>
      </div>
    </div>
  );
}
