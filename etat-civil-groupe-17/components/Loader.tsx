// Écran de chargement : voile aux couleurs du thème et anneau orange / vert de la marque.
export const Loader = () => {
    return (
        <div
            data-slot="loader"
            role="status"
            aria-busy="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-300"
        >
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-card shadow-lg">
                <span className="loader-ring absolute inset-2 rounded-full border-4 animate-spin" />
                <svg viewBox="0 0 40 40" aria-hidden="true" className="h-9 w-9">
                    <path
                        d="M12 2H14V38H12A10 10 0 0 1 2 28V12A10 10 0 0 1 12 2Z"
                        className="fill-brand-orange"
                    />
                    <rect x="14" y="2" width="12" height="36" className="fill-brand-white" />
                    <path
                        d="M26 2H28A10 10 0 0 1 38 12V28A10 10 0 0 1 28 38H26Z"
                        className="fill-brand-green"
                    />
                    <rect x="2.5" y="2.5" width="35" height="35" rx="9.5" fill="none" strokeWidth="1" className="stroke-border" />
                </svg>
            </div>
        </div>
    );
};
