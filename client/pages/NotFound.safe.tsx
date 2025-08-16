import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search, Gamepad2 } from "lucide-react";

export default function NotFoundSafe() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="text-8xl mb-4">🎰</div>
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground mb-8">
            Looks like this page took a spin and landed on empty! Don't worry,
            there are plenty of other great pages to explore.
          </p>

          <div className="space-y-3">
            <Link to="/">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>

            <Link to="/games">
              <Button variant="outline" className="w-full">
                <Gamepad2 className="w-4 h-4 mr-2" />
                Browse Games
              </Button>
            </Link>

            <Link to="/slots">
              <Button variant="outline" className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Try Slots
              </Button>
            </Link>
          </div>

          <div className="mt-8 text-sm text-muted-foreground">
            <p>Safe Mode: All navigation working normally</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
