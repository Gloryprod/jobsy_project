// app/contact/page.tsx
import Header from '@/components/Home/layout/Header';
import Footer from '@/components/Home/layout/Footer';
import { MotionButton } from '@/components/ui/MotionButton';
import { Mail, Phone, MapPin, MessageCircle, Clock, CheckCircle, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-[#FAF9F0] pt-32 pb-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-black text-[#000080] mb-6">
            Contactez-nous !<br />
          </h1>
          <p className="text-xl md:text-2xl text-gray-800">
            Que vous soyiez jeune diplômé ou entreprise,<br />notre équipe à Cotonou répond à toutes vos questions.
          </p>
        </div>
      </section>

      {/* Contact rapide – 3 options */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

            {/* WhatsApp (le plus utilisé au Bénin) */}
            <div className="text-center group">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition">
                <MessageCircle className="w-14 h-14 text-white" />
              </div>
              <h3 className="text-2xl font-black text-[#000080] mb-3">WhatsApp</h3>
              <p className="text-4xl font-black text-green-600 mb-4">+229 97 00 00 00</p>
              <MotionButton variant="primary" className="bg-green-500 hover:bg-green-600 text-white">
                <a href="https://wa.me/22997000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" /> Discuter maintenant
                </a>
              </MotionButton>
              <p className="text-sm text-gray-600 mt-4 flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" /> Réponse garantie en moins de 5 min
              </p>
            </div>

            {/* Appel téléphone */}
            <div className="text-center group">
              <div className="w-24 h-24 bg-[#000080] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition">
                <Phone className="w-14 h-14 text-[#F0E68C]" />
              </div>
              <h3 className="text-2xl font-black text-[#000080] mb-3">Téléphone</h3>
              <p className="text-4xl font-black text-[#000080] mb-4">+229 67 00 00 00</p>
              <MotionButton variant="primary" className="bg-[#000080] hover:bg-[#000066] text-[#F0E68C]">
                <a href="tel:+22967000000" className="flex items-center gap-2">
                  <Phone className="w-5 h-5" /> Appeler maintenant
                </a>
              </MotionButton>
              <p className="text-sm text-gray-600 mt-4 flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" /> Lundi–Samedi • 8h–19h
              </p>
            </div>

            {/* Email / Formulaire */}
            <div className="text-center group">
              <div className="w-24 h-24 bg-[#F0E68C] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition">
                <Mail className="w-14 h-14 text-[#000080]" />
              </div>
              <h3 className="text-2xl font-black text-[#000080] mb-3">Email</h3>
              <p className="text-2xl font-bold text-[#000080] mb-4">contact@jobsy.bj</p>
              <MotionButton variant="primary" className="bg-[#F0E68C] hover:bg-[#e0d67a] text-[#000080]">
                <a href="mailto:contact@jobsy.bj" className="flex items-center gap-2">
                  <Send className="w-5 h-5" /> Envoyer un email
                </a>
              </MotionButton>
              <p className="text-sm text-gray-600 mt-4">
                Réponse sous 24h maximum
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Localisation */}
      <section className="bg-[#000080] text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <MapPin className="w-16 h-16 mx-auto mb-6 text-[#F0E68C]" />
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            On est à Cotonou, comme toi
          </h2>
          <p className="text-2xl mb-8">
            Fidjrossè – Immeuble Jobsy (derrière la pharmacie Fidjro)
          </p>
          <iframe
            src="https://www.google.com/maps/embed?pb=...ton-lien-google-maps..."
            width="100%"
            height="400"
            className="rounded-3xl shadow-2xl max-w-4xl mx-auto"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </section>

      {/* FAQ rapide */}
      <section className="py-20 bg-[#FAF9F0]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-center text-3xl md:text-5xl font-black text-[#000080] mb-16">
            Questions fréquentes
          </h2>

          <div className="space-y-8">
            {[
              { q: "Comment s’inscrire ?", r: "Clique sur « Inscription gratuite » → remplis ton numéro → c’est tout !" },
              { q: "Le paiement est-il sécurisé ?", r: "Oui, via Mobile Money (MTN, Moov). Tu es payé seulement quand la mission est validée." },
              { q: "Les missions sont-elles vraiment rémunérées ?", r: "Oui ! Plus de 2 400 jeunes ont déjà gagné leur salaire sur Jobsy." },
              { q: "Je peux postuler même sans expérience ?", r: "C’est le but ! Jobsy est fait pour donner ta première chance." },
            ].map((faq, i) => (
              <details key={i} className="bg-white rounded-3xl p-6 shadow-lg cursor-pointer">
                <summary className="text-xl font-bold text-[#000080] list-none flex justify-between items-center">
                  {faq.q}
                  <span className="text-[#F0E68C]">▼</span>
                </summary>
                <p className="mt-4 text-gray-700 text-lg">{faq.r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-[#000080] text-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black mb-8">
            Une question ? On t’appelle tout de suite
          </h2>
          <MotionButton
            variant="primary"
            className="text-2xl px-16 py-8 bg-[#F0E68C] text-[#000080] hover:bg-white font-bold"
          >
            Me faire rappeler gratuitement
          </MotionButton>
        </div>
      </section>

      <Footer />
    </>
  );
}