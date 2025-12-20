import { ReactNode } from 'react';

// Layout hanya bertugas merender children
export default function EventDetailLayout({ children }: { children: ReactNode }) {
    return (
        <>
            {children}
        </>
    );
}