'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Navigation from '@/components/Navigation';
import AppointmentModal from '@/components/appointment/AppointmentModal';
import { Calendar, ArrowLeft } from 'lucide-react';

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const triggerType = (searchParams.get('type') || 'rdv') as 'rdv' | 'devis' | 'reservation';

  const handleClose = () => {
    router.push('/');
  };

  const getPageTitle = () => {
    switch (triggerType) {
      case 'devis':
        return 'Demander un devis';
      case 'reservation':
        return 'Réserver un créneau';
      default:
        return 'Prendre rendez-vous';
    }
  };

  const getPageDescription = () => {
    switch (triggerType) {
      case 'devis':
        return 'Obtenez un devis personnalisé pour votre projet digital';
      case 'reservation':
        return 'Réservez un créneau pour discuter de votre projet';
      default:
        return 'Planifiez un rendez-vous pour échanger sur vos besoins';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <Navigation />
      
      {/* Page Header */}
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-[#00F5FF] transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à l'accueil</span>
            </button>
            
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-[#00F5FF] to-[#9D4EDD] rounded-2xl flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {getPageTitle()}
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {getPageDescription()}
            </p>
          </div>
        </div>
      </div>

      {/* Appointment Modal - Always Open */}
      <div className="relative">
        <AppointmentModal
          isOpen={true}
          onClose={handleClose}
          triggerType={triggerType}
        />
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00F5FF]/30 rounded-full animate-spin mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-transparent border-t-[#00F5FF] rounded-full animate-spin" />
          </div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}