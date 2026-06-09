import { motion } from "framer-motion";
import { ReactNode } from "react";

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export const PageTransition = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className={className}>
    {children}
  </motion.div>
);

export const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" as const } },
};
