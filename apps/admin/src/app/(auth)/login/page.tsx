"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, BarChart3, Loader2, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { authService } from "@/services/auth/auth.service";
import { loginSchema, type LoginInput } from "@/services/auth/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: () => {
      router.push("/");
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_440px]">
        <section className="hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <Badge variant="secondary">Admin Access</Badge>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--background)]">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <div className="font-display text-3xl uppercase leading-none tracking-[0.04em]">
                  Football Intel
                </div>
                <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                  Administrative workspace
                </p>
              </div>
            </div>

            <div className="mt-10 max-w-xl space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight">
                Sign in to manage matches, schedules, and review queues.
              </h1>
              <p className="text-base leading-7 text-[color:var(--muted-foreground)]">
                Clean access for the operations team. Use your admin credentials
                to enter the dashboard and continue moderation or live match work.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[color:var(--border)] p-4">
              <p className="text-sm font-medium">Match control</p>
              <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                Track live fixtures and timelines.
              </p>
            </div>
            <div className="rounded-xl border border-[color:var(--border)] p-4">
              <p className="text-sm font-medium">Registry</p>
              <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                Maintain teams, players, and competitions.
              </p>
            </div>
            <div className="rounded-xl border border-[color:var(--border)] p-4">
              <p className="text-sm font-medium">Review queue</p>
              <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                Moderate pending ingestion items.
              </p>
            </div>
          </div>
        </section>

        <Card className="self-center">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--background)]">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-2xl uppercase leading-none tracking-[0.04em]">
                  Football Intel
                </div>
                <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                  Admin
                </p>
              </div>
            </div>
            <div>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>
                Enter your credentials to access the admin dashboard.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted-foreground)]" />
                  <Input
                    type="email"
                    placeholder="admin@football-intel.com"
                    className="pl-9"
                    {...register("email")}
                  />
                </div>
                {errors.email ? (
                  <p className="text-xs text-[color:var(--destructive)]">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Password</label>
                  <span className="text-xs text-[color:var(--muted-foreground)]">
                    Secure access
                  </span>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted-foreground)]" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    {...register("password")}
                  />
                </div>
                {errors.password ? (
                  <p className="text-xs text-[color:var(--destructive)]">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              {loginMutation.isError ? (
                <div className="flex items-start gap-3 rounded-lg border border-[color:var(--destructive)]/20 bg-[color:var(--destructive-soft)] p-3 text-sm text-[color:var(--destructive)]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    {(loginMutation.error as any)?.response?.data?.error ||
                      "Invalid credentials"}
                  </p>
                </div>
              ) : null}

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in
                  </>
                ) : (
                  "Enter dashboard"
                )}
              </Button>
            </form>

            <p className="mt-6 text-xs text-[color:var(--muted-foreground)]">
              Authorized personnel only. Administrative actions are monitored and logged.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
