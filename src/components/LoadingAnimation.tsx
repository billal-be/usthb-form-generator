'use client';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import React from 'react';

const LoadingAnimation: React.FC = () => {
    return (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-white/40 rounded-md">
            <div className="rounded-lg p-8 flex flex-col items-center gap-4">
                <DotLottieReact
                    src="/animations/loading.lottie"
                    loop
                    autoplay
                    style={{ width: 70, height: 70 }}
                />
            </div>
        </div>
    );
};

export default LoadingAnimation;