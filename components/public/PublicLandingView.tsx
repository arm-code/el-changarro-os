'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import * as Icons from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business';
import ProductCarousel from '@/components/products/ProductCarousel';
import ShareButtons from '@/components/ShareButtons';
import { cn } from '@/lib/utils';
import { defaultBusinessConfig } from '@/lib/config';
import type { BusinessConfig } from '@/types/finance';

// ─── Componentes estáticos auxiliares ─────────────────────────────────────────

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border border-violet-200 rounded-xl bg-white overflow-hidden">
      <summary className="flex items-center justify-between gap-4 p-4 cursor-pointer list-none hover:bg-violet-50/50 active:bg-violet-100/50 transition-colors">
        <span className="font-semibold text-violet-900 text-sm">{question}</span>
        <Icons.ChevronDown className="w-4 h-4 text-violet-500 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4 text-violet-600 text-sm border-t border-violet-100 pt-3">
        {answer}
      </div>
    </details>
  );
}

function ValueIcon({ name }: { name: string | null }) {
  if (!name) return <Icons.Star className="w-7 h-7" />;
  const iconName = name.charAt(0).toUpperCase() + name.slice(1);
  const Icon = (Icons as Record<string, any>)[iconName];
  return Icon ? <Icon className="w-7 h-7" /> : <Icons.Star className="w-7 h-7" />;
}

const WHATSAPP_FALLBACK = 'Hola, quiero más información';

function buildWhatsAppUrl(config: BusinessConfig): string {
  const number = config.whatsapp?.replace(/[^0-9]/g, '') ?? '';
  const message = config.whatsappMessage?.trim() || WHATSAPP_FALLBACK;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function PublicLandingView({ negocio }: { negocio: string }) {
  const { data: publicBusiness } = useQuery({
    queryKey: ['publicBusiness', negocio],
    queryFn: () => businessApi.getPublicBusinessBySlug(negocio),
    staleTime: 1000 * 60 * 10, // 10 min
  });

  const config = publicBusiness?.config || defaultBusinessConfig;

  // ── Datos del backend — sin fallbacks de ningún negocio específico ─────────
  const businessName = publicBusiness?.name || config.name || '';
  // logoUrl null = negocio no ha subido logo, NO mostrar imagen de otro negocio
  const logoUrl = publicBusiness?.logoUrl || config.logoUrl || '';
  const phone = config.phone || '';
  const whatsapp = config.whatsapp || '';
  const email = config.email || '';
  const address = config.address || '';
  const description = config.description || '';
  const openingHours = config.openingHours || '';
  const historyText = config.history || '';
  const missionText = config.mission || '';
  const visionText = config.vision || '';
  const services = config.services?.length ? config.services : [];
  const coverageAreas = config.coverageAreas?.length ? config.coverageAreas : [];
  const paymentCards = config.paymentCards || [];
  
  // ── Nuevos campos Fase 2 ──
  const gallery = config.gallery || [];
  const values = config.values || [];
  const stats = config.stats || [];
  const testimonials = config.testimonials || [];
  const faqs = config.faqs || [];

  // ── Links de contacto ──────────────────────────────────────────────────────
  const phoneRaw = phone.replace(/[^0-9+]/g, '');
  const waLink = buildWhatsAppUrl(config);

  const hasContact = phone || whatsapp || email;
  const hasHistoryOrMission = historyText || missionText || visionText;

  return (
    <div className="min-h-screen">
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-violet-50 to-white pt-8 pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">

            {/* Logo — solo si existe */}
            {logoUrl && (
              <div className="flex justify-center mb-5">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                  <Image
                    src={logoUrl}
                    alt={`Logotipo de ${businessName}`}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            )}

            {/* Nombre del negocio */}
            {businessName && (
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-violet-900 mb-3">
                {businessName}
              </h1>
            )}

            {/* Descripción — solo si existe */}
            {description && (
              <p className="text-base sm:text-lg text-violet-600 max-w-2xl mx-auto leading-relaxed">
                {description}
                {address && (
                  <>
                    {' '}
                    <strong className="text-violet-700">{address}</strong>.
                  </>
                )}
              </p>
            )}

            {/* Trust badges — solo si hay datos de contacto relevantes */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
              {openingHours && (
                <span className="flex items-center gap-1.5 bg-white text-violet-700 px-3 py-1.5 rounded-full border border-violet-200 shadow-sm">
                  <Icons.Clock className="w-3.5 h-3.5" />
                  {openingHours}
                </span>
              )}
              {address && (
                <span className="flex items-center gap-1.5 bg-white text-violet-700 px-3 py-1.5 rounded-full border border-violet-200 shadow-sm">
                  <Icons.MapPin className="w-3.5 h-3.5" />
                  {address}
                </span>
              )}
            </div>

            {/* CTAs de contacto */}
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              {!hasContact ? (
                <div className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-bold text-sm bg-gray-100 text-gray-500 border border-gray-200">
                  Información de contacto no disponible
                </div>
              ) : (
                <>
                  {whatsapp && (
                    <Link
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-bold text-sm',
                        'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
                        'transition-colors shadow-lg shadow-green-600/20',
                        'active:scale-[0.97]'
                      )}
                    >
                      <Icons.Phone className="w-4 h-4" />
                      Cotizar por WhatsApp
                    </Link>
                  )}
                  {phone && (
                    <a
                      href={`tel:${phoneRaw}`}
                      className={cn(
                        'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-bold text-sm',
                        'bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800',
                        'transition-colors shadow-lg shadow-violet-600/20',
                        'active:scale-[0.97]'
                      )}
                    >
                      <Icons.Phone className="w-4 h-4" />
                      Llamar {phone}
                    </a>
                  )}
                </>
              )}
            </div>

            {/* Compartir */}
            <ShareButtons />
          </div>
        </div>
      </section>

      {/* ── CARRUSEL ────────────────────────────────────────────────── */}
      {gallery.length > 0 && <ProductCarousel items={gallery} />}

      {/* ── CONTENT ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 space-y-8">

        {/* Historia + Misión — solo si algún campo viene del backend */}
        {hasHistoryOrMission && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {historyText && (
              <section className="bg-white rounded-2xl shadow-sm border border-violet-100 p-5 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-violet-900 mb-3">Nuestra historia</h2>
                <p className="text-violet-600 text-sm leading-relaxed">{historyText}</p>
              </section>
            )}

            {(missionText || visionText) && (
              <section className="bg-white rounded-2xl shadow-sm border border-violet-100 p-5 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-violet-900 mb-3">Misión y visión</h2>
                <div className="space-y-2.5">
                  {missionText && (
                    <div>
                      <h3 className="font-semibold text-violet-700 text-sm">Misión:</h3>
                      <p className="text-violet-600 text-sm">{missionText}</p>
                    </div>
                  )}
                  {visionText && (
                    <div>
                      <h3 className="font-semibold text-violet-700 text-sm">Visión:</h3>
                      <p className="text-violet-600 text-sm">{visionText}</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Valores */}
        {values.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-violet-100 p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-violet-900 mb-6 text-center">Nuestros valores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {values.map((v) => (
                <div key={v.id} className="text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                    <ValueIcon name={v.icon} />
                  </div>
                  <h3 className="font-bold text-violet-900 text-sm mb-1">{v.title}</h3>
                  {v.description && <p className="text-violet-600 text-sm">{v.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Catálogo de Servicios — solo si tiene items */}
        {services.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-violet-100 p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-violet-900 mb-5">
              {businessName ? `Servicios de ${businessName}` : 'Nuestros servicios'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {services.map((item, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'bg-violet-50 border border-violet-200 rounded-xl p-4 text-center',
                    'text-violet-700 font-medium text-sm flex flex-col items-center justify-center gap-1',
                    'hover:bg-violet-100 active:bg-violet-200 active:scale-[0.98]',
                    'transition-all cursor-pointer select-none'
                  )}
                >
                  <span className="text-2xl block">✨</span>
                  {item}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cuentas Bancarias — solo si existen */}
        {paymentCards.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-violet-100 p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-violet-900 mb-2 flex items-center gap-2">
              <Icons.CreditCard className="w-5 h-5 text-violet-600" />
              Cuentas para anticipos y transferencias
            </h2>
            <p className="text-xs text-violet-500 mb-4">
              Información oficial para liquidación de pedidos o reserva de fecha.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paymentCards.map((card, idx) => (
                <div key={card.id || idx} className="p-3.5 rounded-xl border border-violet-100 bg-violet-50/50">
                  <p className="text-xs font-bold text-violet-950">{card.bank} — {card.beneficiary}</p>
                  {card.clabe && (
                    <p className="text-xs text-violet-700 font-mono mt-1">CLABE: <strong>{card.clabe}</strong></p>
                  )}
                  {card.cardNumber && (
                    <p className="text-xs text-violet-600 font-mono mt-0.5">Tarjeta: {card.cardNumber}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Métricas + Cobertura */}
        {(stats.length > 0 || coverageAreas.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {stats.length > 0 && (
              <section className="bg-white rounded-2xl shadow-sm border border-violet-100 p-5 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-violet-900 mb-5">En números</h2>
                <dl className="grid grid-cols-3 gap-4 text-center">
                  {stats.map((stat) => (
                    <div key={stat.id}>
                      <dt className="text-2xl sm:text-3xl font-bold text-violet-900">{stat.value}</dt>
                      <dd className="text-violet-600 text-xs sm:text-sm mt-1">{stat.label}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {coverageAreas.length > 0 && (
              <section className="bg-white rounded-2xl shadow-sm border border-violet-100 p-5 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-violet-900 mb-3">Cobertura</h2>
                <div className="flex items-start gap-3">
                  <Icons.MapPin className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" />
                  <p className="text-violet-600 text-sm leading-relaxed">
                    {address && <><strong className="text-violet-700">{address}</strong>. </>}
                    Cobertura disponible en:{' '}
                    <strong className="text-violet-700">
                      {coverageAreas.join(', ')}
                    </strong>.
                  </p>
                </div>
              </section>
            )}
          </div>
        )}

        {/* Testimonios */}
        {testimonials.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-violet-100 p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-violet-900 mb-5">Lo que dicen nuestros clientes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icons.Star
                        key={i}
                        className={cn(
                          'w-3.5 h-3.5',
                          i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-violet-200'
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-violet-700 text-sm mb-3 italic">&ldquo;{t.text}&rdquo;</p>
                  <p className="text-violet-900 font-bold text-xs">— {t.author}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {faqs.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-violet-100 p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-violet-900 mb-5">Preguntas frecuentes</h2>
            <div className="space-y-2.5">
              {faqs.map((faq) => (
                <FaqItem key={faq.id} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── CTA FINAL ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-violet-600 to-violet-800 px-4 sm:px-6 py-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {businessName ? `Contacta a ${businessName}` : '¿Listo para tu evento?'}
          </h2>
          {openingHours && (
            <p className="text-violet-200 mb-3 text-sm flex items-center justify-center gap-2">
              <Icons.Clock className="w-4 h-4" />
              {openingHours}
            </p>
          )}
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
            {!hasContact ? (
              <div className="inline-flex items-center justify-center h-12 px-6 rounded-xl font-bold text-sm bg-violet-800/50 text-violet-200 border border-violet-700/50">
                Contacto no disponible por el momento
              </div>
            ) : (
              <>
                {whatsapp && (
                  <Link
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-bold text-sm',
                      'bg-green-500 hover:bg-green-400 active:bg-green-600 text-white',
                      'transition-colors shadow-lg',
                      'active:scale-[0.97]'
                    )}
                  >
                    <Icons.Phone className="w-4 h-4" />
                    WhatsApp
                  </Link>
                )}
                {phone && (
                  <a
                    href={`tel:${phoneRaw}`}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-bold text-sm',
                      'bg-white text-violet-700 hover:bg-violet-50 active:bg-violet-100',
                      'transition-colors shadow-lg',
                      'active:scale-[0.97]'
                    )}
                  >
                    <Icons.Phone className="w-4 h-4" />
                    Llamar {phone}
                  </a>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-bold text-sm',
                      'bg-violet-700 hover:bg-violet-600 active:bg-violet-800 text-white',
                      'border border-violet-500',
                      'transition-colors shadow-lg',
                      'active:scale-[0.97]'
                    )}
                  >
                    <Icons.Mail className="w-4 h-4" />
                    {email}
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
