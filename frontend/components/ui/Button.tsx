import { ButtonHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'white'; // Tambah varian 'white'
  children: ReactNode;
}

export default function Button({ className, variant = 'primary', children, ...props }: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2";
  
  const variants = {
    // Primary tetap Oranye (sesuai request button orange)
    primary: "bg-brand-orange text-white hover:bg-brand-orange-dark shadow-md hover:shadow-lg",
    
    // Secondary Biru
    secondary: "bg-brand-blue text-white hover:bg-brand-blue-light shadow-sm",
    
    // Outline Biru
    outline: "border-2 border-brand-blue text-brand-blue hover:bg-brand-blue/10",
    
    // Ghost (biasanya untuk text link)
    ghost: "text-gray-600 hover:bg-gray-100",

    // BARU: Varian Putih (Khusus untuk ditaruh di atas background Oranye/Biru)
    white: "bg-white text-brand-orange hover:bg-gray-100 shadow-sm border border-transparent",
  };

  return (
    <button className={twMerge(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}