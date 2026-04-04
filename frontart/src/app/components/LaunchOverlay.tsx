import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import logo from '../../assets/artvpplogo.png';

export function LaunchOverlay({ onLaunch }: { onLaunch: () => void }) {
    const [launching, setLaunching] = useState(false);
    const [particles, setParticles] = useState<number[]>([]);

    const handleLaunch = () => {
        setLaunching(true);
        // Create burst particles
        setParticles(Array.from({ length: 40 }, (_, i) => i));

        // Let the animation play, then reveal the site
        setTimeout(() => {
            onLaunch();
        }, 2000);
    };

    return (
        <AnimatePresence>
            {!launching ? (
                <motion.div
                    key="overlay"
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
                    style={{ background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0f 70%)' }}
                >
                    {/* Animated background particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        {Array.from({ length: 80 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 rounded-full"
                                style={{
                                    background: i % 4 === 0 ? '#a73f2b' : i % 4 === 1 ? '#b30452' : i % 4 === 2 ? '#E8C84A' : 'rgba(255,255,255,0.4)',
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                                animate={{
                                    y: [0, -50, 0],
                                    x: [0, Math.random() * 20 - 10, 0],
                                    opacity: [0.1, 0.6, 0.1],
                                    scale: [1, 2, 1],
                                }}
                                transition={{
                                    duration: 4 + Math.random() * 6,
                                    repeat: Infinity,
                                    delay: Math.random() * 5,
                                    ease: 'easeInOut',
                                }}
                            />
                        ))}
                    </div>

                    {/* Ambient light effects */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                            className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[120px]"
                            style={{ background: 'radial-gradient(circle, #a73f2b 0%, transparent 70%)' }}
                            animate={{
                                scale: [1, 1.2, 1],
                                x: [0, 30, 0],
                                y: [0, 20, 0],
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div
                            className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[120px]"
                            style={{ background: 'radial-gradient(circle, #b30452 0%, transparent 70%)' }}
                            animate={{
                                scale: [1.2, 1, 1.2],
                                x: [0, -30, 0],
                                y: [0, -20, 0],
                            }}
                            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    </div>

                    {/* Glowing ring behind logo */}
                    <motion.div
                        className="absolute rounded-full border border-white/5"
                        style={{
                            width: 380,
                            height: 380,
                            background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 75%)',
                        }}
                        animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.3, 0.6, 0.3],
                            rotate: [0, 360],
                        }}
                        transition={{
                            scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                            opacity: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                            rotate: { duration: 25, repeat: Infinity, ease: 'linear' }
                        }}
                    />

                    {/* Logo Section */}
                    <div className="relative z-10 flex flex-col items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{
                                duration: 1.5,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="mb-10"
                        >
                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                <img
                                    src={logo}
                                    alt="ArtVPP"
                                    className="w-36 h-36 md:w-48 md:h-48 object-contain drop-shadow-[0_0_30px_rgba(232,200,74,0.3)] filter contrast-110"
                                />
                            </motion.div>
                        </motion.div>

                        {/* Title */}
                        <motion.div
                            initial={{ opacity: 0, letterSpacing: '0.4em' }}
                            animate={{ opacity: 1, letterSpacing: '0.25em' }}
                            transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
                            className="text-center mb-6"
                        >
                            <h1 className="text-6xl md:text-7xl font-light text-white overflow-hidden" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                                <motion.span
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    transition={{ duration: 1, delay: 0.8 }}
                                    className="inline-block"
                                >
                                    ART<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a73f2b] to-[#b30452] font-bold">VPP</span>
                                </motion.span>
                            </h1>
                        </motion.div>

                        {/* Tagline */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1.5, delay: 1.5 }}
                            className="mb-20 text-center"
                        >
                            <span className="text-sm md:text-base tracking-[0.6em] text-white/40 uppercase font-light">
                                Where Art Meets Freedom
                            </span>
                            <motion.div
                                className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#a73f2b]/50 to-transparent mx-auto mt-4"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 1.5, delay: 2 }}
                            />
                        </motion.div>

                        {/* Launch Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 2.2 }}
                            className="relative group"
                        >
                            {/* Animated background glow for button */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#a73f2b] to-[#b30452] rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

                            <motion.button
                                onClick={handleLaunch}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                className="relative px-16 py-5 bg-white text-black font-bold text-lg tracking-[0.3em] uppercase rounded-full overflow-hidden transition-all duration-300"
                            >
                                <span className="relative z-10">Launch Gallery</span>
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-neutral-100 to-white"
                                />
                                {/* Shiny effect on hover */}
                                <motion.div
                                    className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-25deg] z-20"
                                    animate={{ left: ['-100%', '200%'] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                                />
                            </motion.button>

                            {/* Ornamental rings */}
                            <motion.div
                                className="absolute -inset-4 rounded-full border border-[#a73f2b]/20"
                                animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                            />
                        </motion.div>
                    </div>

                    {/* Bottom decorative text */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 3, duration: 1.5 }}
                        className="absolute bottom-12 flex flex-col items-center gap-4 z-10"
                    >
                        <p className="text-white/20 text-[10px] tracking-[0.5em] uppercase">
                            Digital Art Marketplace • Est. 2024
                        </p>
                        <div className="w-1 h-12 bg-gradient-to-b from-white/20 to-transparent" />
                    </motion.div>
                </motion.div>
            ) : (
                /* Launch Animation */
                <motion.div
                    key="launching"
                    className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
                    style={{ background: '#0a0a0f' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Burst particles */}
                    {particles.map((i) => {
                        const angle = (i / 40) * Math.PI * 2;
                        const distance = 600 + Math.random() * 400;
                        return (
                            <motion.div
                                key={i}
                                className="absolute rounded-full"
                                style={{
                                    width: 4 + Math.random() * 8,
                                    height: 4 + Math.random() * 8,
                                    background: i % 3 === 0 ? '#a73f2b' : i % 3 === 1 ? '#a73f2b' : '#fff',
                                    left: '50%',
                                    top: '50%',
                                }}
                                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                                animate={{
                                    x: Math.cos(angle) * distance,
                                    y: Math.sin(angle) * distance,
                                    opacity: 0,
                                    scale: 0,
                                }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                            />
                        );
                    })}

                    {/* Center flash */}
                    <motion.div
                        className="absolute rounded-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)]"
                        initial={{ width: 0, height: 0, opacity: 1 }}
                        animate={{ width: 3000, height: 3000, opacity: 0 }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                    />

                    {/* Text */}
                    <motion.h2
                        className="relative z-10 text-4xl md:text-6xl font-bold text-white tracking-[0.3em]"
                        style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.1, 1, 1.2] }}
                        transition={{ duration: 2, times: [0, 0.3, 0.7, 1] }}
                    >
                        WELCOME
                    </motion.h2>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

