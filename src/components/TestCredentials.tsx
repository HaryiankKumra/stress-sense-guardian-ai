import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TestCredentialsProps {
  onFillCredentials?: (email: string, password: string) => void;
}

export function TestCredentials({ onFillCredentials }: TestCredentialsProps) {
  const { toast } = useToast();

  const testAccounts = [
    {
      email: "test@stressguard.ai",
      password: "password123",
      name: "Test User",
    },
    {
      email: "demo@stressguard.ai",
      password: "demo123",
      name: "Demo User",
    },
  ];

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  const fillCredentials = (email: string, password: string) => {
    if (onFillCredentials) {
      onFillCredentials(email, password);
    }
  };

  return (
    <Card className="mt-4 bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-sky-700 dark:text-sky-300">
          <User className="w-4 h-4" />
          Test Accounts
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {testAccounts.map((account, index) => (
            <div key={index} className="space-y-2">
              <div className="text-xs font-medium text-sky-600 dark:text-sky-400">
                {account.name}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded border">
                    {account.email}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(account.email, "Email")}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded border">
                    {account.password}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() =>
                      copyToClipboard(account.password, "Password")
                    }
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              {onFillCredentials && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs bg-sky-100 hover:bg-sky-200 dark:bg-sky-800 dark:hover:bg-sky-700 border-sky-300 dark:border-sky-600"
                  onClick={() =>
                    fillCredentials(account.email, account.password)
                  }
                >
                  Use This Account
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
