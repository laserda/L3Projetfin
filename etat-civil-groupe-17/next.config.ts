import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Lint et vérification des types à lancer à part (npm run lint, npx tsc --noEmit)
    // pour réduire la mémoire consommée par `next build`
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
    experimental: {
        webpackMemoryOptimizations: true,
        cpus: 1,
        optimizePackageImports: ["recharts", "date-fns"],
    },
};

export default nextConfig;
