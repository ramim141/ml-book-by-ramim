import React from 'react';
import { motion } from 'framer-motion';

export default function StoryDialogue({ title, dialogues, itemVariants }) {
  return (
    <motion.div variants={itemVariants} className="space-y-6">
      <h2 className="flex items-center gap-2 pb-2 font-sans text-xl font-bold text-white border-b border-white/5">
        <span className="text-[#4f46e5] text-lg">■</span>
        {title}
      </h2>
      
      <div className="space-y-5 text-left sm:space-y-6 sm:text-justify">
        {dialogues.map((dlg, idx) => (
          <p key={idx} className="indent-0 leading-relaxed text-[#c6c5d4] sm:indent-6">
            {dlg.text}
          </p>
        ))}
      </div>
    </motion.div>
  );
}
