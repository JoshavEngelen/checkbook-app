import { Button } from "@/shared/components";

interface SectionErrorProps {
  message: string;
  onRetry: () => void;
}

export function SectionError({ message, onRetry }: SectionErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-100 bg-red-50 py-10 text-center">
      <p className="text-sm text-red-700">{message}</p>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
