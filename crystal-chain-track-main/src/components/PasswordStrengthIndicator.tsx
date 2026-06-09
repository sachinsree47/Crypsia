import { Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const rules: PasswordRule[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { label: "One number", test: (pw) => /[0-9]/.test(pw) },
  { label: "One special character (!@#$%^&*)", test: (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw) },
];

export const validatePassword = (pw: string) => rules.every((r) => r.test(pw));

export const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  if (!password) return null;

  const passed = rules.filter((r) => r.test(password)).length;
  const strength = passed / rules.length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="space-y-2"
      >
        {/* Strength bar */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i < passed
                  ? strength <= 0.4
                    ? "bg-destructive"
                    : strength <= 0.7
                    ? "bg-yellow-500"
                    : "bg-primary"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Rules list */}
        <div className="grid gap-1">
          {rules.map((rule) => {
            const met = rule.test(password);
            return (
              <motion.div
                key={rule.label}
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  met ? "text-primary" : "text-muted-foreground"
                }`}
                animate={{ x: met ? 0 : 0, opacity: 1 }}
              >
                {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                {rule.label}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
