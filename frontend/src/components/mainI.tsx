"use client";
import { HeartPulse, TreePine, Gamepad2 } from "lucide-react";
import SpotlightCard from "./SpotlightCard";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.30 
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.7
    }
  }
};


const MainI = () => {
    return (
        <motion.div 
            className="flex gap-4"
            variants={container}
            initial="hidden"
            animate="show"
        >
            <motion.div variants={item}>
                <SpotlightCard className="custom-spotlight-card text-sky-700 w-[400px] h-[346px] p-12" spotlightColor="rgba(255, 83, 83, 0.82)">
                    <HeartPulse className="w-12 h-12 text-red-500 animate-pulse mb-4" />
                    <div>
                      <h2 className="text-2xl font-bold mb-2 text-red-500">Квалифицированная забота</h2>
                      <p className="text-lg text-white">
                        Опытные врачи, педагоги и воспитатели заботятся о здоровье и развитии каждого ребёнка.
                      </p>
                    </div>
                </SpotlightCard>
            </motion.div>
            
            <motion.div variants={item}>
                <SpotlightCard className="custom-spotlight-card text-sky-700 w-[400px] bg-sky-600 p-12" spotlightColor="rgba(10, 255, 51, 0.32)">
                    <TreePine className="w-12 h-12 text-green-300 animate-pulse mb-4" />
                    <div>
                      <h2 className="text-2xl font-bold mb-2 text-green-300">Чистый воздух и природа</h2>
                      <p className="text-lg text-white">
                        Мы находимся вдали от шума города, в зелёной зоне, где дети восстанавливаются с удовольствием.
                      </p>
                    </div>
                </SpotlightCard>
            </motion.div>
            
            <motion.div variants={item}>
                <SpotlightCard className="custom-spotlight-card text-sky-700 w-[400px] bg-sky-800 p-12" spotlightColor="rgba(68, 0, 177, 0.82)">
                    <Gamepad2 className="w-12 h-12 text-violet-500 animate-pulse mb-4" />
                    <div>
                      <h2 className="text-2xl font-bold mb-2 text-violet-400">Игры, творчество и общение</h2>
                      <p className="text-lg text-white">
                        Каждый день наполнен интересными занятиями, новыми друзьями и радостными моментами.
                      </p>
                    </div>
                </SpotlightCard>
            </motion.div>
        </motion.div>
     );
}
 
export default MainI;