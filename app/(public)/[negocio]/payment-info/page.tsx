'use client';

import React, { useState } from 'react';
import {
  CreditCard, Building2, User, Copy, CheckCircle2, Banknote,
  ArrowRight, Phone, Share2, Loader2, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTenant } from '@/components/providers/TenantProvider';
import { toLandingModel } from '@/lib/landing/model';

/* ────────────────────────────────────────────────────────────────────────────
   COMPONENTE: CopyField
   Campo copiable con feedback táctil y accesibilidad.
   ─────────────────────────────────────────────────────────────────────────── */
function CopyField({
  label,
  value,
  icon: Icon,
  fieldId,
  copiedField,
  onCopy,
  monospace = false,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  fieldId: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  monospace?: boolean;
}) {
  const copied = copiedField === fieldId;
  const isUnavailable = value.toLowerCase().includes('no disponible');

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3.5 rounded-xl border transition-all',
        isUnavailable
          ? 'bg-muted border-border opacity-60'
          : 'bg-brand/5 border-brand/20'
      )}
    >
      <div className={cn(
        'flex h-10 w-10 items-center justify-center rounded-lg shrink-0',
        isUnavailable ? 'bg-muted text-muted-foreground' : 'bg-brand/10 text-brand'
      )}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-brand/70 uppercase tracking-wider">
          {label}
        </p>
        <p className={cn(
          'font-semibold text-foreground text-sm truncate',
          monospace && 'font-mono'
        )}>
          {value}
        </p>
      </div>

      {!isUnavailable && (
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => onCopy(value, fieldId)}
          className={cn(
            'flex items-center justify-center gap-1.5 h-10 px-3 rounded-lg text-xs font-bold transition-all duration-200 shrink-0',
            'active:scale-95 touch-manipulation min-w-[80px]',
            copied
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
              : 'bg-background text-brand border border-border hover:bg-brand/5 shadow-sm'
          )}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Listo</span>
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   COMPONENTE: PaymentInfoPage (Multi-Tenant)
   Usa useTenant() — sin token, 0 errores 401.
   ─────────────────────────────────────────────────────────────────────────── */
export default function PaymentInfoPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Datos del negocio vienen del TenantProvider (API pública, sin auth)
  const { isLoading, businessName, whatsapp, paymentCards, negocio, publicBusiness } = useTenant();
  const model = publicBusiness ? toLandingModel(publicBusiness) : null;
  const palette = model?.palette || 'elegant';

  const copyToClipboard = async (text: string, field: string) => {
    const clean = text.replace(/\s/g, '');
    try {
      await navigator.clipboard.writeText(clean);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      const el = document.createElement('textarea');
      el.value = clean;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const sharePaymentInfo = async (account: any) => {
    const url = window.location.href;
    const text = `Realiza tu transferencia a ${businessName || 'nosotros'}.\n\nIngresa al siguiente link para ver los datos bancarios y copiar la información fácilmente:\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Link de pago', text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopiedField('share-all-' + account.id);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  return (
    <div className="landing min-h-screen bg-background py-6 px-4 sm:px-6 lg:px-8" data-palette={palette}>
      {/* Header compacto */}
      <div className="max-w-xl mx-auto text-center mb-8">
        <div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-14 h-14 bg-brand/10 rounded-2xl mb-3"
          >
            <Banknote className="w-7 h-7 text-brand" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Datos para transferencia
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            Realiza tu pago de forma rápida y segura.
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto space-y-5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-brand/70 bg-card rounded-2xl border border-border shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium">Cargando información de pago...</p>
          </div>
        ) : paymentCards.length === 0 ? (
          <div className="bg-card rounded-2xl shadow-sm border border-border p-8 text-center text-muted-foreground">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium text-lg">No hay cuentas bancarias registradas</p>
            <p className="text-sm mt-1">Por favor, contacta directamente al negocio.</p>
          </div>
        ) : (
          paymentCards.map((account, index) => {
            return (
              <motion.div
                key={account.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden"
              >
                {/* Tarjeta decorativa */}
                <div className="bg-brand p-5 sm:p-6 text-brand-foreground relative overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-brand-foreground/10 rounded-full" />
                  <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-brand-foreground/10 rounded-full" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 opacity-80" />
                        <span className="font-bold text-lg tracking-wide">{account.bank}</span>
                      </div>
                      <span className="text-2xl">🏦</span>
                    </div>

                    <div className="mb-3">
                      <p className="opacity-60 text-[10px] uppercase tracking-wider mb-1">
                        Número de tarjeta
                      </p>
                      <p className="text-xl sm:text-2xl font-mono font-semibold tracking-wider">
                        {account.cardNumber || 'No disponible'}
                      </p>
                    </div>

                    <div>
                      <p className="opacity-60 text-[10px] uppercase tracking-wider mb-1">
                        Titular
                      </p>
                      <p className="font-semibold text-base sm:text-lg">
                        {account.beneficiary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Campos copiables */}
                <div className="p-4 sm:p-5 space-y-2.5">
                  <CopyField
                    label="Banco"
                    value={account.bank}
                    icon={Building2}
                    fieldId={`${account.id}-bank`}
                    copiedField={copiedField}
                    onCopy={copyToClipboard}
                  />
                  {account.cardNumber && (
                    <CopyField
                      label="Número de tarjeta"
                      value={account.cardNumber}
                      icon={CreditCard}
                      fieldId={`${account.id}-card`}
                      copiedField={copiedField}
                      onCopy={copyToClipboard}
                      monospace
                    />
                  )}
                  {account.clabe && (
                    <CopyField
                      label="CLABE interbancaria"
                      value={account.clabe}
                      icon={Banknote}
                      fieldId={`${account.id}-clabe`}
                      copiedField={copiedField}
                      onCopy={copyToClipboard}
                      monospace
                    />
                  )}
                  <CopyField
                    label="Beneficiario"
                    value={account.beneficiary}
                    icon={User}
                    fieldId={`${account.id}-beneficiary`}
                    copiedField={copiedField}
                    onCopy={copyToClipboard}
                  />
                </div>

                {/* Botón compartir todo */}
                <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => sharePaymentInfo(account)}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-sm',
                      'bg-brand text-brand-foreground hover:opacity-90 active:scale-95',
                      'transition-all shadow-sm'
                    )}
                  >
                    {copiedField === 'share-all-' + account.id ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>¡Copiado al portapapeles!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span>Compartir datos para transferencia</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            );
          })
        )}

        {/* Aviso importante */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
            <div>
              <p className="font-bold text-amber-800 text-sm mb-1">Importante</p>
              <ul className="text-amber-700 text-xs sm:text-sm space-y-1">
                <li>• Envía tu comprobante por WhatsApp para confirmar tu reserva.</li>
                <li>• Verifica bien el número antes de transferir.</li>
                <li>• Solo transferencias bancarias, no depósitos en efectivo.</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* CTA WhatsApp */}
        {whatsapp ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-5 sm:p-6 text-center shadow-sm"
          >
            <p className="text-foreground font-semibold text-sm mb-4">
              ¿Ya hiciste tu transferencia?
            </p>
            <Link
              href={`https://wa.me/${whatsapp}?text=Hola,%20realicé%20mi%20transferencia%20y%20quiero%20confirmar%20mi%20reserva`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-sm',
                'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
                'transition-colors shadow-md shadow-green-600/20',
                'w-full'
              )}
            >
              <Phone className="w-5 h-5" />
              <span>Enviar comprobante por WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-50 border border-gray-200 rounded-2xl p-5 sm:p-6 text-center shadow-sm"
          >
            <p className="text-gray-500 font-semibold text-sm">
              Contacto no disponible por el momento.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
