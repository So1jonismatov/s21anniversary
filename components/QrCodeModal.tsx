"use client";

import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export default function QrCodeModal({
  isOpen,
  onClose,
  url,
}: QrCodeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/10 rounded-2xl shadow-xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <QRCodeSVG
              value={url}
              size={256}
              bgColor="#00000000"
              fgColor="#ffffff"
              level="H"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
