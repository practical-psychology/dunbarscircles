import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageLayout from "../components/PageLayout";
import { ContactsDashboard } from "@/components/contacts-dashboard";
import { LiquidCard } from "@/components/ui/liquid-card";
import { LiquidButton } from "@/components/ui/liquid-button";
import { 
  Users, 
  Plus, 
  Upload, 
  Search,
  Filter,
  Download,
  Settings
} from "lucide-react";
import { dunbarLevels } from "../data/dunbarLevels";

export default function ContactsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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

  if (isLoading) {
    return (
      <PageLayout
        title="Contact Management"
        description="Manage your relationships and social network data"
      >
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg text-gray-600 dark:text-gray-300">
              Loading contacts...
            </span>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Contact Management"
      description="Manage your relationships and social network data"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Quick Actions Header */}
        <motion.div variants={itemVariants}>
          <LiquidCard glow>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.div
                  className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Users className="w-6 h-6" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Contact Management Hub
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Import, organize, and manage your social network relationships
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/contacts/import">
                  <LiquidButton variant="primary" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Import Contacts
                  </LiquidButton>
                </Link>
                <Link to="/contacts/edit/new">
                  <LiquidButton variant="secondary" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Contact
                  </LiquidButton>
                </Link>
              </div>
            </div>
          </LiquidCard>
        </motion.div>

        {/* Quick Stats Cards */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <LiquidCard hover>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg text-white">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-600 dark:text-green-400">
                    Quick Search
                  </h3>
                  <p className="text-sm text-gray-500">Find contacts</p>
                </div>
              </div>
            </LiquidCard>

            <LiquidCard hover>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg text-white">
                  <Filter className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-600 dark:text-blue-400">
                    Smart Filters
                  </h3>
                  <p className="text-sm text-gray-500">By level & source</p>
                </div>
              </div>
            </LiquidCard>

            <LiquidCard hover>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg text-white">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-600 dark:text-purple-400">
                    Export Data
                  </h3>
                  <p className="text-sm text-gray-500">Multiple formats</p>
                </div>
              </div>
            </LiquidCard>

            <LiquidCard hover>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg text-white">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-600 dark:text-orange-400">
                    Manage Settings
                  </h3>
                  <p className="text-sm text-gray-500">Preferences</p>
                </div>
              </div>
            </LiquidCard>
          </div>
        </motion.div>

        {/* Main Contacts Dashboard */}
        <motion.div variants={itemVariants}>
          <ContactsDashboard levels={dunbarLevels} />
        </motion.div>

        {/* Navigation Help */}
        <motion.div variants={itemVariants}>
          <LiquidCard>
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Need Help Getting Started?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Import your social media data to automatically categorize your relationships 
                according to Dunbar's hierarchy, or manually add contacts to build your network.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/contacts/import">
                  <LiquidButton variant="primary">
                    Import from Social Media
                  </LiquidButton>
                </Link>
                <Link to="/network">
                  <LiquidButton variant="ghost">
                    View Network Visualization
                  </LiquidButton>
                </Link>
              </div>
            </div>
          </LiquidCard>
        </motion.div>
      </motion.div>
    </PageLayout>
  );
}