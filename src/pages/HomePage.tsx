import { trackEvent } from "../../lib/analytics";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LiquidCard } from "@/components/ui/liquid-card";
import { LiquidButton } from "@/components/ui/liquid-button";
import { NetworkDiagram } from "@/components/network-diagram";
import { Eye, Users, Heart, Book, Share2, ShieldCheck } from "lucide-react";
import PageLayout from "../components/PageLayout";
import { dunbarLevels } from "../data/dunbarLevels";

export default function HomePage() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const exploreLevel = (levelId: string) => {
    setSelectedLevel(levelId);
    document
      .getElementById("network-diagram-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <PageLayout
      title="Overview"
      description="Interactive network diagram and relationship category overview"
      subtitle="See who is in your inner circle and who has drifted. Place the people you know into Dunbar's five layers in minutes, free and with no account."
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Hero strip: privacy badge (#43) and static preview (#51) */}
        <motion.section
          variants={itemVariants}
          aria-label="At a glance"
          className="flex flex-col items-center gap-6 md:flex-row md:justify-center md:gap-10"
        >
          <img
            src="/circles-preview.svg"
            width={240}
            height={240}
            alt="Five nested circles around you: about 5 in the inner circle, then about 15, 50, 150 and 500 people in each wider layer."
            className="h-48 w-48 shrink-0 md:h-60 md:w-60"
            decoding="async"
            fetchPriority="high"
          />
          <div className="flex max-w-md flex-col items-center gap-4 text-center md:items-start md:text-left">
            <p className="text-gray-700 dark:text-gray-200">
              Each ring holds about three times as many people as the one inside
              it. Place your own people and see where your time goes.
            </p>
            <Link
              to="/privacy"
              data-testid="privacy-badge"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-100 dark:border-green-700 dark:bg-green-950 dark:text-green-200 dark:hover:bg-green-900"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Stored in your browser · cloud backup optional
            </Link>
          </div>
        </motion.section>

        <motion.div variants={itemVariants}>
          <LiquidCard glow>
            <div className="space-y-4" id="network-diagram-section">
              <div className="flex items-center gap-3">
                <motion.div
                  className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Eye className="w-5 h-5" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Interactive Network Diagram
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Click any circle to explore that level.
                  </p>
                </div>
              </div>

              <div className="relative">
                <NetworkDiagram
                  levels={dunbarLevels}
                  selectedLevel={selectedLevel}
                  onLevelSelect={setSelectedLevel}
                />

                {!selectedLevel && (
                  <motion.div
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-gray-900/80 px-4 py-2 text-sm text-white shadow-lg pointer-events-none"
                    animate={{ opacity: [0.7, 1, 0.7], y: [0, -3, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    role="note"
                  >
                    <Eye className="w-4 h-4" aria-hidden="true" />
                    Click a circle to explore it
                  </motion.div>
                )}

                {/* Liquid overlay effects */}
                <motion.div
                  className="absolute top-4 left-4 w-3 h-3 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-60"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.6, 0.3, 0.6],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute bottom-6 right-6 w-2 h-2 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-60"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 0.4, 0.6],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
              </div>
            </div>
          </LiquidCard>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <LiquidCard hover>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <motion.div
                  className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl text-white"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Heart className="w-5 h-5" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
                    Intimate Levels
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    5-50 people
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                The few people you would call at 2am. Notice who is missing
                before it matters.
              </p>
              <LiquidButton
                variant="primary"
                size="sm"
                className="w-full"
                aria-label="Explore intimate relationship levels (5-50 people)"
                onClick={() => exploreLevel("inner-circle")}
              >
                Explore Intimate Bonds
              </LiquidButton>
            </div>
          </LiquidCard>

          <LiquidCard hover>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <motion.div
                  className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Users className="w-5 h-5" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-green-600 dark:text-green-400">
                    Social Levels
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    About 150-500 people
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                The friends and colleagues worth a message this month. See who
                you are overdue to reach.
              </p>
              <LiquidButton
                variant="secondary"
                size="sm"
                className="w-full"
                aria-label="Discover social relationship levels (about 150-500 people)"
                onClick={() => exploreLevel("active-network")}
              >
                Discover Social Circles
              </LiquidButton>
            </div>
          </LiquidCard>

          <LiquidCard hover>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <motion.div
                  className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Share2 className="w-5 h-5" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    Outer Layers
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    500 and beyond (1,500+ is tentative)
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Familiar faces and old contacts. Decide who deserves more of
                your time and who can stay a pleasant hello.
              </p>
              <LiquidButton
                variant="ghost"
                size="sm"
                className="w-full"
                aria-label="View outer layers (500 and beyond; layers past 500 are tentative)"
                onClick={() => exploreLevel("recognition-group")}
              >
                View Outer Layers
              </LiquidButton>
            </div>
          </LiquidCard>
        </motion.div>

        {/* Floating action section */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <motion.h2
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Ready to map your social circles?
          </motion.h2>
          <div className="flex flex-col items-center gap-3">
            <Link
              to="/contacts"
              onClick={() => trackEvent("cta_click", { cta: "map_my_circles" })}
            >
              <LiquidButton
                variant="primary"
                size="lg"
                aria-label="Map my circles: open your contacts"
              >
                Map My Circles
              </LiquidButton>
            </Link>
            <Link
              to="/onboarding"
              onClick={() => trackEvent("start_tour")}
              className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-blue-700 underline underline-offset-2 dark:text-blue-300"
            >
              <Book className="w-4 h-4" aria-hidden="true" />
              Not sure where to start? Take the 10 minute tour
            </Link>
          </div>
        </motion.div>

        {/* The five layers */}
        <motion.section
          variants={itemVariants}
          aria-labelledby="layers-heading"
        >
          <h2
            id="layers-heading"
            className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white"
          >
            The 5 layers of Dunbar&apos;s number
          </h2>
          <p className="mx-auto mb-4 max-w-2xl text-center text-sm text-gray-600 dark:text-gray-300">
            Rough averages from studies of many people, not limits. Each layer
            includes the ones inside it. The 150 figure is an estimate (about
            100–250); see{" "}
            <Link to="/evidence" className="underline underline-offset-2">
              Evidence &amp; Limitations
            </Link>
            .
          </p>
          <ul className="flex flex-wrap justify-center gap-3 text-sm">
            {[
              ["5", "Inner Circle"],
              ["15", "Sympathy Group"],
              ["50", "Affinity Group"],
              ["150", "Active Network"],
              ["500", "Recognition Group"],
            ].map(([n, name]) => (
              <li
                key={n}
                className="rounded-full border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 px-4 py-2 text-gray-800 dark:text-gray-100"
              >
                <strong>{n}</strong> {name}
              </li>
            ))}
          </ul>
        </motion.section>

        {/* How it works */}
        <motion.section variants={itemVariants} aria-labelledby="how-heading">
          <h2
            id="how-heading"
            className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white"
          >
            How it works
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-800 dark:text-gray-100">
            {[
              [
                "1. List your people",
                "Type in people yourself, bring them in from a file, or start with sample data.",
              ],
              [
                "2. See your circles",
                "Place each person in one of five layers and see your whole network at a glance.",
              ],
              [
                "3. Explore connections",
                "Click any circle to see who is in it, then reach out to whoever has drifted.",
              ],
            ].map(([t, d]) => (
              <li
                key={t}
                className="rounded-xl bg-white/70 dark:bg-gray-900/60 p-4 border border-gray-200 dark:border-gray-700"
              >
                <h3 className="font-semibold mb-1">{t}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{d}</p>
              </li>
            ))}
          </ol>
        </motion.section>

        {/* FAQ */}
        <motion.section
          variants={itemVariants}
          aria-labelledby="faq-heading"
          className="max-w-3xl mx-auto w-full"
        >
          <h2
            id="faq-heading"
            className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white"
          >
            Frequently asked questions
          </h2>
          <div className="space-y-2 text-gray-800 dark:text-gray-100">
            {[
              [
                "Do I need an account?",
                "No. You can use everything without signing in. Signing in with Google is optional and is only for cloud backup.",
              ],
              [
                "Where is my data stored?",
                "Contacts are saved in your browser's local storage. If you choose to sign in, a backup copy is also saved to your account in the cloud.",
              ],
              [
                "Can I take my data with me?",
                "Yes. You can download your contacts as JSON or CSV, or print a report.",
              ],
              [
                "Is this based on real research?",
                "Yes. It is based on the research of Professor Robin Dunbar (University of Oxford), who proposed that people maintain roughly 150 meaningful relationships (estimates range about 100–250, and the figure is debated). See Evidence & Limitations for sources.",
              ],
            ].map(([q, a]) => (
              <details
                key={q}
                className="rounded-xl bg-white/70 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 px-4 py-1"
              >
                <summary className="cursor-pointer py-3 font-medium">
                  {q}
                </summary>
                <p className="pb-3 text-sm text-gray-600 dark:text-gray-300">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </PageLayout>
  );
}
