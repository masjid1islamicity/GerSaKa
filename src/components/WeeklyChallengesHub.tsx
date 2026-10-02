import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WeeklyChallenge, MemberAutomatedPoints, ChallengeParticipantScore } from "../types";
import { playCelebrationChime } from "./HealthGoalsNotificationSystem";
import { fireBadgeCelebrationConfetti, fireGrandCelebration } from "../utils/confetti";
import {
  Trophy,
  Award,
  Crown,
  Sparkles,
  Flame,
  Zap,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Share2,
  CheckCircle2,
  Target,
  ShieldCheck,
  TrendingUp,
  PartyPopper,
  Info,
  Gift,
  Coins
} from "lucide-react";

interface WeeklyChallengesHubProps {
  challenges: WeeklyChallenge[];
  memberPoints: MemberAutomatedPoints[];
  selectedChallengeId: string;
  onSelectChallenge: (id: string) => void;
  onSelectMember: (memberId: string) => void;
  onShowToast?: (message: string, type: "success" | "info" | "warning") => void;
  onSyncWearablePoints?: () => void;
  isSyncingPoints?: boolean;
}

export const WeeklyChallengesHub: React.FC<WeeklyChallengesHubProps> = ({
  challenges,
  memberPoints,
  selectedChallengeId,
  onSelectChallenge,
  onSelectMember,
  onShowToast,
  onSyncWearablePoints,
  isSyncingPoints = false
}) => {
  const [activeTab, setActiveTab] = useState<"challenge_detail" | "points_leaderboard">("challenge_detail");
  const [expandedBreakdownId, setExpandedBreakdownId] = useState<string | null>(null);

  // Active challenge
  const currentChallenge = challenges.find((c) => c.id === selectedChallengeId) || challenges[0];

  // Family points stats
  const totalFamilyPoints = memberPoints.reduce((acc, curr) => acc + curr.totalPoints, 0);
  const totalWeeklyPoints = memberPoints.reduce((acc, curr) => acc + curr.weeklyPoints, 0);

  // Toggle breakdown accordion
  const toggleBreakdown = (memberId: string) => {
    setExpandedBreakdownId(expandedBreakdownId === memberId ? null : memberId);
  };

  // Celebrate challenge leader
  const handleCelebrateLeader = (participant: ChallengeParticipantScore, event: React.MouseEvent) => {
    const originX = Math.max(0.1, Math.min(0.9, event.clientX / window.innerWidth));
    const originY = Math.max(0.1, Math.min(0.9, event.clientY / window.innerHeight));
    fireBadgeCelebrationConfetti(originX, originY);
    playCelebrationChime();

    if (onShowToast) {
      onShowToast(
        `🎉 Luar biasa! ${participant.memberName} saat ini memimpin tantangan "${currentChallenge.title}" dengan ${participant.pointsEarned.toLocaleString("id-ID")} poin otomatis!`,
        "success"
      );
    }
  };

  // Celebrate total family points milestone
  const handleCelebratePointsPool = () => {
    fireGrandCelebration();
    playCelebrationChime();
    if (onShowToast) {
      onShowToast(
        `🏆 Fantastis! Akumulasi ${totalFamilyPoints.toLocaleString("id-ID")} poin kesehatan telah otomatis terkumpul dari sinkronisasi seluruh perangkat keluarga!`,
        "success"
      );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
      
      {/* 1. Header & Family Points Vault Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
              Fitur Baru
            </span>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Sistem Poin Otomatis Wearable
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <span>Tantangan Mingguan & Papan Poin</span>
            <span className="text-lg">🎯</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Setiap langkah, menit aktif, jam tidur nyenyak, dan rekor streak langsung terkonversi menjadi poin otomatis keluarga.
          </p>
        </div>

        {/* Family Points Vault & Sync Button */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <div 
            onClick={handleCelebratePointsPool}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-yellow-500/15 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-300 dark:border-amber-700/80 cursor-pointer hover:border-amber-400 transition-all group"
            title="Klik untuk merayakan capaian total poin keluarga!"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Poin Keluarga
              </div>
              <div className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <span>{totalFamilyPoints.toLocaleString("id-ID")}</span>
                <span className="text-[11px] font-bold text-slate-500">Pts</span>
                <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Real-time Wearable Point Sync Button */}
          {onSyncWearablePoints && (
            <button
              onClick={onSyncWearablePoints}
              disabled={isSyncingPoints}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
              title="Sinkronisasikan metrik wearable dan perbarui poin otomatis"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${isSyncingPoints ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Sinkronisasi Poin</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Sub-Tabs: Tantangan Aktif vs Klasemen Poin */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("challenge_detail")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "challenge_detail"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Tantangan Mingguan ({challenges.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("points_leaderboard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "points_leaderboard"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Papan Poin Otomatis & Tier</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Diperbarui otomatis dari sensor smartwatch
        </span>
      </div>

      {activeTab === "challenge_detail" ? (
        <div className="space-y-4">
          {/* 3. Challenge Carousel / Selector Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {challenges.map((c) => {
              const isSelected = c.id === selectedChallengeId;
              const leader = c.participants[0];

              return (
                <button
                  key={c.id}
                  onClick={() => onSelectChallenge(c.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-gradient-to-br from-amber-50/90 to-orange-50/80 dark:from-amber-950/40 dark:to-orange-950/30 border-amber-400 ring-2 ring-amber-400/40 shadow-xs"
                      : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/80 hover:border-amber-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl filter drop-shadow-xs">{c.icon}</span>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      ⏱️ {c.daysRemaining}H Lagi
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {c.title}
                  </h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    Hadiah: {c.badgeRewardIcon} {c.badgeReward}
                  </p>

                  <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Pemimpin:</span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400 truncate ml-1">
                      👑 {leader?.memberName.split(" ")[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 4. Active Challenge Spotlight Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-rose-500/15 dark:from-amber-950/50 dark:via-orange-950/40 dark:to-rose-950/40 border-2 border-amber-300/80 dark:border-amber-700 shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Challenge Overview */}
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-2xl shadow-md shadow-amber-500/30 shrink-0">
                  {currentChallenge.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {currentChallenge.title}
                    </h4>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                      Tantangan Aktif
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {currentChallenge.subtitle}
                  </p>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold mt-1 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-amber-600" />
                    <span>Target: {currentChallenge.targetGoalDescription}</span>
                  </p>
                </div>
              </div>

              {/* Prize Reward Card */}
              <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-amber-200 dark:border-amber-800/80 shadow-xs shrink-0">
                <div className="text-2xl filter drop-shadow-xs">
                  {currentChallenge.badgeRewardIcon}
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Lencana Hadiah Juara
                  </div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">
                    {currentChallenge.badgeReward}
                  </div>
                  <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    +{currentChallenge.prizePoolPoints} Poin Juara Tantangan
                  </div>
                </div>
              </div>

            </div>

            {/* Point Rules Explainer Box */}
            <div className="mt-3.5 pt-3 border-t border-amber-200/70 dark:border-amber-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  <strong>Aturan Poin Otomatis:</strong> {currentChallenge.pointRules.description}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 italic">
                {currentChallenge.clinicalNote.split(":")[0]}: {currentChallenge.clinicalNote.split(":")[1]?.slice(0, 70)}...
              </div>
            </div>
          </div>

          {/* 5. Live Challenge Participant Standings with Automated Points */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
              <span>Klasemen Peserta Tantangan ({currentChallenge.participants.length} Anggota)</span>
              <span>Poin Terkumpul Otomatis</span>
            </div>

            <div className="space-y-2.5">
              {currentChallenge.participants.map((p) => {
                const isLeader = p.rank === 1;
                const isExpanded = expandedBreakdownId === p.memberId;
                const medal = p.rank === 1 ? "🥇" : p.rank === 2 ? "🥈" : p.rank === 3 ? "🥉" : `#${p.rank}`;

                return (
                  <div
                    key={p.memberId}
                    className={`rounded-xl border transition-all ${
                      isLeader
                        ? "bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/80 shadow-xs"
                        : "bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <div className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      
                      {/* Left: Rank, Avatar, Name & Value */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Rank Badge */}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${
                          isLeader
                            ? "bg-amber-500 text-white shadow-xs"
                            : p.rank === 2
                            ? "bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-white"
                            : p.rank === 3
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}>
                          {medal}
                        </div>

                        {/* Avatar */}
                        <img
                          src={p.avatarUrl}
                          alt={p.memberName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
                          onClick={() => onSelectMember(p.memberId)}
                        />

                        {/* Member Details & Current Value */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 
                              onClick={() => onSelectMember(p.memberId)}
                              className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-amber-600"
                            >
                              {p.memberName}
                            </h5>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              ({p.memberRole})
                            </span>
                            {isLeader && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xs">
                                Pemimpin 👑
                              </span>
                            )}
                          </div>

                          {/* Progress Bar & Value */}
                          <div className="mt-1 flex items-center gap-2.5">
                            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, p.progressPercent)}%` }}
                                transition={{ duration: 0.6 }}
                                className={`h-full rounded-full ${
                                  isLeader
                                    ? "bg-gradient-to-r from-amber-400 to-orange-500"
                                    : "bg-emerald-500"
                                }`}
                              />
                            </div>
                            <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 shrink-0">
                              {p.currentValue.toLocaleString("id-ID")} {p.unit}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              ({p.progressPercent}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Points Earned & Action */}
                      <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-700/60">
                        <div className="text-left sm:text-right">
                          <div className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 flex items-center gap-1 sm:justify-end">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>+{p.pointsEarned.toLocaleString("id-ID")} Pts</span>
                          </div>
                          <button
                            onClick={() => toggleBreakdown(p.memberId)}
                            className="text-[10px] font-semibold text-slate-500 hover:text-amber-600 flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Rincian</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>

                        {/* Celebrate Button */}
                        <button
                          onClick={(e) => handleCelebrateLeader(p, e)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
                          title="Kirim apresiasi & luncurkan confetti"
                        >
                          <PartyPopper className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Rayakan</span>
                        </button>
                      </div>

                    </div>

                    {/* Expandable Automated Point Breakdown */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-4 pb-3 pt-1 border-t border-slate-200/70 dark:border-slate-700/70 bg-white/50 dark:bg-slate-900/30 text-xs"
                        >
                          <div className="text-[11px] font-bold text-slate-500 mb-1.5">
                            Rincian Perhitungan Poin Otomatis:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {p.breakdown.map((item, idx) => (
                              <div
                                key={idx}
                                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-between"
                              >
                                <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                                  {item.label}
                                </span>
                                <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 ml-2 shrink-0">
                                  +{item.points} Pts
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* 6. Points Leaderboard & Tier Status View */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border border-indigo-300 dark:border-indigo-700">
              <div className="text-xl mb-1">💎 Diamond Elite</div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Target &gt; 2.200 Poin</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Tingkatan tertinggi konsistensi dan stamina</p>
            </div>
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-teal-500/15 to-emerald-500/15 border border-teal-300 dark:border-teal-700">
              <div className="text-xl mb-1">🏆 Platinum Stride</div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Target 1.700 - 2.199 Poin</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Sangat aktif memenuhi sasaran mingguan</p>
            </div>
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 border border-amber-300 dark:border-amber-700">
              <div className="text-xl mb-1">🥇 Gold Champion</div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Target 1.200 - 1.699 Poin</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Mempertahankan rutinitas sehat konsisten</p>
            </div>
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-500/15 to-blue-500/15 border border-slate-300 dark:border-slate-700">
              <div className="text-xl mb-1">🥈 Silver Active</div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Target &lt; 1.200 Poin</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Langkah awal membangun konsistensi</p>
            </div>
          </div>

          {/* Member Points Rankings */}
          <div className="space-y-3">
            {memberPoints.map((mp) => {
              return (
                <div
                  key={mp.memberId}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-sm flex items-center justify-center shrink-0">
                      #{mp.rank}
                    </div>

                    <img
                      src={mp.avatarUrl}
                      alt={mp.memberName}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {mp.memberName}
                        </h5>
                        <span className="text-xs text-slate-500">({mp.memberRole})</span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-black bg-gradient-to-r ${mp.tierColor} border shadow-2xs`}>
                          {mp.tierBadge} {mp.tier}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                        <span>Aktivitas Sensor: <strong>{mp.baseActivityPoints} Pts</strong></span>
                        <span>•</span>
                        <span>Streak: <strong>{mp.streakBonusPoints} Pts</strong></span>
                        <span>•</span>
                        <span>Tantangan: <strong>{mp.challengeBonusPoints} Pts</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Total Points Score */}
                  <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700">
                    <div className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">
                      {mp.totalPoints.toLocaleString("id-ID")} Pts
                    </div>
                    <div className="text-[10px] text-slate-400">
                      +{mp.weeklyPoints.toLocaleString("id-ID")} poin minggu ini
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
