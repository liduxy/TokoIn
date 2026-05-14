import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden 
            bg-gradient-to-br from-indigo-700 via-purple-700 to-blue-900">

            <div className="absolute top-[35%] right-[2%] -translate-y-1/2 opacity-30
    sm:top-[30%] sm:right-[15%]
    md:right-[20%]
    lg:right-[23%]">

    <img 
        src="/assets/images/Star.png" 
        alt="star"
        className="
            w-32        /* HP (default) */
            sm:w-40     /* tablet kecil */
            md:w-56     /* tablet */
            lg:w-72     /* desktop */
        "
    />
</div>

            {/* Logo */}
            <div className="mb-4">
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20" />
                </Link>
            </div>

            {/* Content */}
            <div className="w-full px-6 py-4 sm:max-w-md">
                {children}
            </div>
        </div>
    );
}