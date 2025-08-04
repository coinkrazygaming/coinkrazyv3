import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bot,
  CheckCircle,
  Clock,
  AlertTriangle,
  Gift,
  Star,
  Users,
  Shield,
  Upload,
  Camera,
  FileText,
  Coins,
  Trophy,
  ArrowRight,
  X,
  MessageCircle,
  Zap,
} from "lucide-react";
import {
  joseyAiOnboardingService,
  UserAccount,
  OnboardingStep,
  JoseyAiResponse,
} from "@/services/joseyAiOnboardingService";

interface JoseyAiOnboardingProps {
  userId: string;
  className?: string;
}

const JoseyAiOnboarding: React.FC<JoseyAiOnboardingProps> = ({
  userId,
  className = "",
}) => {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([]);
  const [aiResponses, setAiResponses] = useState<JoseyAiResponse[]>([]);
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null);
  const [showJoseyAi, setShowJoseyAi] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);

  useEffect(() => {
    loadUserAccount();

    // Subscribe to JoseyAI responses
    const unsubscribe = joseyAiOnboardingService.subscribeToResponses(
      (responseUserId, response) => {
        if (responseUserId === userId) {
          setAiResponses((prev) => [response, ...prev.slice(0, 9)]);
          setShowJoseyAi(true);
        }
      },
    );

    return unsubscribe;
  }, [userId]);

  const loadUserAccount = () => {
    let userAccount = joseyAiOnboardingService.getUserAccount(userId);

    if (!userAccount) {
      // Create new account if doesn't exist
      userAccount = joseyAiOnboardingService.createUserAccount({
        id: userId,
        email: "user@example.com", // Would come from auth system
        username: "Player",
        accountType: "user",
      });
    }

    setAccount(userAccount);
    const steps = joseyAiOnboardingService.getOnboardingSteps(
      userAccount.accountType,
    );
    setOnboardingSteps(steps);

    // Find current step
    const current = steps.find(
      (step) =>
        !step.completed &&
        (!step.dependsOn ||
          step.dependsOn.every((dep) =>
            userAccount!.onboardingData.completedSteps.includes(dep),
          )),
    );
    setCurrentStep(current || null);

    // Load recent AI responses
    const responses = joseyAiOnboardingService.getUserResponses(userId, 5);
    setAiResponses(responses);
  };

  const completeStep = (stepId: string) => {
    const success = joseyAiOnboardingService.completeOnboardingStep(
      userId,
      stepId,
    );
    if (success) {
      loadUserAccount();
    }
  };

  const getStepIcon = (step: OnboardingStep) => {
    if (step.completed)
      return <CheckCircle className="w-5 h-5 text-green-500" />;

    switch (step.type) {
      case "welcome":
        return <Bot className="w-5 h-5 text-purple-500" />;
      case "education":
        return <Users className="w-5 h-5 text-blue-500" />;
      case "kyc":
        return <Shield className="w-5 h-5 text-orange-500" />;
      case "verification":
        return <FileText className="w-5 h-5 text-red-500" />;
      case "completion":
        return <Trophy className="w-5 h-5 text-gold-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getProgressPercentage = () => {
    if (!account) return 0;
    const totalSteps = onboardingSteps.filter((s) => s.required).length;
    const completedSteps = onboardingSteps.filter(
      (s) => s.required && s.completed,
    ).length;
    return (completedSteps / totalSteps) * 100;
  };

  const handleEducationComplete = () => {
    completeStep("education");
    setShowEducationModal(false);
  };

  if (!account || !account.onboardingRequired) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Onboarding Complete!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Welcome to CoinKrazy! You're all set up and ready to play.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* JoseyAI Chat Interface */}
      {showJoseyAi && (
        <Card className="border-purple-500/30 bg-gradient-to-r from-purple-900/10 to-purple-800/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-500" />
                JoseyAI Assistant
                <Badge
                  variant="outline"
                  className="text-xs border-green-500 text-green-400"
                >
                  LIVE
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowJoseyAi(false)}
                className="p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {aiResponses.map((response) => (
                <div key={response.id} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white/90">
                        {response.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-purple-300">
                          {response.timestamp.toLocaleTimeString()}
                        </span>
                        {response.actionRequired && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-6 border-purple-500 text-purple-400"
                            onClick={() => {
                              if (
                                response.actionRequired?.type ===
                                "complete_education"
                              ) {
                                setShowEducationModal(true);
                              } else if (
                                response.actionRequired?.type ===
                                "upload_document"
                              ) {
                                setShowKycModal(true);
                              }
                            }}
                          >
                            {response.actionRequired.description}
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onboarding Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-500" />
            Your Onboarding Progress
            <Badge variant="outline" className="text-xs">
              {Math.round(getProgressPercentage())}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={getProgressPercentage()} className="h-2" />

          <div className="space-y-3">
            {onboardingSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-3 rounded-lg border transition-all duration-200 ${
                  step.completed
                    ? "border-green-500/30 bg-green-500/5"
                    : currentStep?.id === step.id
                      ? "border-purple-500/30 bg-purple-500/5"
                      : "border-border"
                }`}
              >
                <div className="flex-shrink-0">{getStepIcon(step)}</div>

                <div className="flex-1">
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>

                  {step.incentives && !step.completed && (
                    <div className="flex items-center gap-2 mt-1">
                      <Gift className="w-3 h-3 text-gold-500" />
                      <span className="text-xs text-gold-400">
                        Reward:{" "}
                        {step.incentives.gcReward &&
                          `${step.incentives.gcReward.toLocaleString()} GC`}
                        {step.incentives.scReward &&
                          ` + ${step.incentives.scReward} SC`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {step.completed ? (
                    <Badge
                      variant="outline"
                      className="text-green-400 border-green-500"
                    >
                      Complete
                    </Badge>
                  ) : currentStep?.id === step.id ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        if (step.id === "welcome") {
                          completeStep(step.id);
                        } else if (step.id === "education") {
                          setShowEducationModal(true);
                        } else if (step.id === "kyc_documents") {
                          setShowKycModal(true);
                        }
                      }}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Start
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Education Modal */}
      <Dialog open={showEducationModal} onOpenChange={setShowEducationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              CoinKrazy vs The Competition
            </DialogTitle>
            <DialogDescription>
              Learn what makes CoinKrazy the best sweepstakes casino platform
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-purple-400">
                  🏆 CoinKrazy Advantages
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-500" />
                    Instant withdrawals (not 3-7 days like others)
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gold-500" />
                    Better odds and higher RTPs
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    Real human customer support
                  </li>
                  <li className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-purple-500" />
                    Daily bonuses and promotions
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    Transparent and fair gaming
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-red-400">
                  ❌ Other Platforms
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Slow 3-7 day withdrawal processing</li>
                  <li>• Lower RTPs and worse odds</li>
                  <li>• Chatbot-only customer service</li>
                  <li>• Hidden fees and terms</li>
                  <li>• Limited game selection</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">🎯 Why Choose CoinKrazy?</h4>
              <p className="text-sm text-muted-foreground">
                We're not just another sweepstakes casino. We're a
                community-driven platform that puts players first. Our AI
                assistants, real-time support, and innovative features create
                the best social gaming experience available.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEducationModal(false)}
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleEducationComplete}
              className="bg-purple-600 hover:bg-purple-700"
            >
              I Understand - Claim Bonus!
              <Coins className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KYC Modal */}
      <Dialog open={showKycModal} onOpenChange={setShowKycModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-500" />
              KYC Verification Required
            </DialogTitle>
            <DialogDescription>
              Upload your documents to enable withdrawals and full platform
              access
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 border-dashed border-orange-500/30">
                <div className="text-center space-y-2">
                  <Camera className="w-8 h-8 text-orange-500 mx-auto" />
                  <h4 className="font-medium">Photo ID</h4>
                  <p className="text-xs text-muted-foreground">
                    Government-issued ID (Driver's License, Passport, etc.)
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    <Upload className="w-3 h-3 mr-2" />
                    Upload ID
                  </Button>
                </div>
              </Card>

              <Card className="p-4 border-dashed border-orange-500/30">
                <div className="text-center space-y-2">
                  <FileText className="w-8 h-8 text-orange-500 mx-auto" />
                  <h4 className="font-medium">Utility Bill</h4>
                  <p className="text-xs text-muted-foreground">
                    Recent bill showing same name and address as ID
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    <Upload className="w-3 h-3 mr-2" />
                    Upload Bill
                  </Button>
                </div>
              </Card>
            </div>

            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-400">
                  KYC Completion Bonus
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Complete KYC verification and receive 10 Sweeps Coins bonus!
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowKycModal(false)}>
              Complete Later
            </Button>
            <Button
              onClick={() => {
                // Simulate KYC completion
                joseyAiOnboardingService.updateKycStatus(
                  userId,
                  "under_review",
                );
                completeStep("kyc_documents");
                setShowKycModal(false);
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Submit Documents
              <Shield className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JoseyAiOnboarding;
