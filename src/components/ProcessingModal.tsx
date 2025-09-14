import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Check, Zap, StopCircle } from 'lucide-react';

interface ProcessingStep {
  id: string;
  label: string;
  completed: boolean;
}

interface ProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onComplete: () => void;
  title?: string;
  description?: string;
}

export function ProcessingModal({
  isOpen,
  onClose,
  onCancel,
  onComplete,
  title = "Processing Image",
  description = "BreedSense AI is analyzing your image for breed identification"
}: ProcessingModalProps) {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: 'analyzing', label: 'Analyzing Image', completed: false },
    { id: 'detecting', label: 'Detecting animals', completed: false },
    { id: 'classifying', label: 'Classifying breeds', completed: false },
    { id: 'generating', label: 'Generating results', completed: false },
  ]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setProgress(0);
      setCurrentStepIndex(0);
      setSteps(prev => prev.map(step => ({ ...step, completed: false })));
      return;
    }

    // Simulate processing steps
    const stepDuration = 1000; // 1 second per step
    const progressInterval = 50; // Update progress every 50ms

    const totalDuration = steps.length * stepDuration;
    const progressIncrement = (100 / totalDuration) * progressInterval;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + progressIncrement, 100);

        // Update current step based on progress
        const newStepIndex = Math.floor((newProgress / 100) * steps.length);
        setCurrentStepIndex(newStepIndex);

        // Mark completed steps
        setSteps(prevSteps =>
          prevSteps.map((step, index) => ({
            ...step,
            completed: index < newStepIndex || newProgress >= 100
          }))
        );

        // Complete processing when reaching 100%
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 500);
        }

        return newProgress;
      });
    }, progressInterval);

    return () => clearInterval(interval);
  }, [isOpen, steps.length, onComplete]);

  const handleCancel = () => {
    onCancel();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-green-500/30 text-white max-w-md" hideCloseButton>
        <DialogHeader className="hidden">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 text-white">
                <svg viewBox="0 0 24 24" fill="currentColor" className="animate-spin">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-medium text-white mb-2">{title}</h2>
            <p className="text-sm text-gray-300">{description}</p>
          </div>

          {/* Progress Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-300">Progress</span>
              </div>
              <span className="text-green-500 font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress
              value={progress}
              className="h-2 bg-gray-800"
            />
          </div>

          {/* Processing Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border transition-all duration-300
                  ${step.completed
                    ? 'bg-green-500/10 border-green-500/30'
                    : index === currentStepIndex && progress < 100
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-gray-800/50 border-gray-700/50'
                  }
                `}
              >
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
                  ${step.completed
                    ? 'bg-green-500 text-white'
                    : index === currentStepIndex && progress < 100
                      ? 'bg-green-500 text-black'
                      : 'bg-gray-600 text-gray-400'
                  }
                `}>
                  {step.completed ? (
                    <Check className="w-3 h-3" />
                  ) : index === currentStepIndex && progress < 100 ? (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 bg-current rounded-full" />
                  )}
                </div>
                <span className={`
                  font-medium transition-colors duration-300
                  ${step.completed
                    ? 'text-green-400'
                    : index === currentStepIndex && progress < 100
                      ? 'text-green-400'
                      : 'text-gray-400'
                  }
                `}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Cancel Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              disabled={progress >= 100}
            >
              <StopCircle className="w-4 h-4 mr-2" />
              Cancel Processing
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}