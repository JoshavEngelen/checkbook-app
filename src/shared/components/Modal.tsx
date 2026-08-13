"use client";

import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import clsx from "clsx";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className }: ModalProps) {
  const reduced = useReducedMotion();

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.15 }}
        >
          <div
            className="absolute inset-0 bg-black/40"
            aria-hidden="true"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={clsx(
              "relative z-10 rounded-lg bg-white p-6 shadow-xl",
              className
            )}
            initial={{ opacity: 0, scale: 0.97, y: reduced ? 0 : 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: reduced ? 0 : 6 }}
            transition={{ duration: reduced ? 0 : 0.18, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
