"use client";

import { useRouter } from "next/navigation";
import { BarChart3, Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth/auth.service";
import { loginSchema, type LoginInput } from "@/services/auth/types";

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
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-6 relative overflow-hidden font-sans">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20 mb-4 animate-in fade-in zoom-in duration-700">
            <BarChart3 className="w-8 h-8 text-slate-950" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Football<span className="text-emerald-500">Intel</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Data Authority Control Room
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl shadow-black/50 overflow-hidden relative">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Admin Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  {...register("email")}
                  placeholder="admin@football-intel.com"
                  className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-400 ml-1 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                Password
                <span className="text-[10px] lowercase tracking-normal font-normal cursor-pointer hover:text-emerald-500 transition-colors">
                  Forgot?
                </span>
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-400 ml-1 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {loginMutation.isError && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                <p className="text-sm font-semibold text-rose-400">
                  {(loginMutation.error as any)?.response?.data?.error ||
                    "Invalid credentials"}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-950 font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 flex items-center justify-center gap-2 group transform active:scale-[0.98]"
            >
              {loginMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Enter Control Room
                  <BarChart3 className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 font-medium tracking-tight">
              Restricted access for authorized personnel only.
              <br />
              All activities are logged.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center animate-in fade-in duration-1000 delay-500">
          <p className="text-slate-500 text-sm">
            Powered by{" "}
            <span className="text-white font-bold tracking-tight">
              PrecisionEngine™
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
