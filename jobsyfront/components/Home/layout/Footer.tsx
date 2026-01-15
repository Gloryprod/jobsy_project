// components/layout/Footer.tsx
'use client';

import Link from "next/link";
import { Zap, Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-[#000080] text-white pt-16 pb-20 md:pb-16">

      
      <div className="max-w-7xl mx-auto px-6">

        {/* === VERSION MOBILE : tout en colonne, centré, aéré === */}
        <div className="flex flex-col items-center text-center space-y-12 md:hidden">

          {/* Logo + slogan */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-16 h-16 bg-[#F0E68C] rounded-2xl flex items-center justify-center shadow-2xl">
                <Zap className="w-10 h-10 text-[#000080]" strokeWidth={3} />
              </div>
              <h2 className="text-4xl font-black tracking-tighter">Jobsy</h2>
            </div>
            <p className="text-[#F0E68C] font-medium text-lg max-w-xs mx-auto leading-relaxed">
              La passerelle entre ton diplôme<br />et ton premier salaire.
            </p>
          </div>

          {/* Liens rapides – gros boutons tactiles */}
          <div className="w-full max-w-xs space-y-3">
            <h3 className="text-[#F0E68C] font-bold text-lg mb-4">Accès rapide</h3>
            {[
              { href: "/missions", label: "Micro-missions" },
              { href: "/formations", label: "Formations gratuites" },
              { href: "/entreprises", label: "Entreprises" },
              { href: "/contact", label: "Contact & Support" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block py-4 text-lg font-medium hover:text-[#F0E68C] border-b border-white/20 last:border-0 transition"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div className="space-y-4 w-full max-w-xs">
            <h3 className="text-[#F0E68C] font-bold text-lg">Contact</h3>
            <div className="space-y-3 text-white/90">
              <a href="mailto:contact@jobsy.bj" className="flex items-center justify-center gap-3">
                <Mail className="w-5 h-5" /> contact@jobsy.bj
              </a>
              <a href="tel:+22967000000" className="flex items-center justify-center gap-3">
                <Phone className="w-5 h-5" /> +229 67 00 00 00
              </a>
              <div className="flex items-center justify-center gap-3">
                <MapPin className="w-5 h-5" /> Cotonou, Fidjrossè
              </div>
            </div>
          </div>

          {/* Réseaux sociaux – gros et tactiles */}
          <div className="flex gap-6">
            <a href="#" className="w-14 h-14 bg-white/10 backdrop-blur rounded-full flex items-center justify-center hover:bg-[#F0E68C] hover:text-[#000080] transition">
              <Facebook className="w-7 h-7" />
            </a>
            <a href="#" className="w-14 h-14 bg-white/10 backdrop-blur rounded-full flex items-center justify-center hover:bg-[#F0E68C] hover:text-[#000080] transition">
              <Instagram className="w-7 h-7" />
            </a>
            <a href="#" className="w-14 h-14 bg-white/10 backdrop-blur rounded-full flex items-center justify-center hover:bg-[#F0E68C] hover:text-[#000080] transition">
              <Linkedin className="w-7 h-7" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-white/60">
            © {currentYear} Jobsy • Créé au Bénin
          </p>
        </div>

        {/* === VERSION DESKTOP : ton ancien layout (4 colonnes) === */}
        <div className="hidden md:grid md:grid-cols-4 gap-12">

          {/* Colonne 1 – Logo + Slogan */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-[#F0E68C] rounded-2xl flex items-center justify-center shadow-xl">
                <Zap className="w-9 h-9 text-[#000080]" strokeWidth={3} />
              </div>
              <h2 className="text-3xl font-black tracking-tighter">Jobsy</h2>
            </div>
            <p className="text-[#F0E68C] font-medium text-lg leading-relaxed">
              La passerelle entre ton diplôme<br />et ton premier salaire.
            </p>
            <p className="text-sm text-white/70 mt-4">
              © {currentYear} Jobsy • Créé au Bénin, pour le Bénin
            </p>
          </div>

          {/* Colonne 2 – Jeunes */}
          <div>
            <h3 className="text-[#F0E68C] font-bold text-lg mb-5">Jeunes diplômés</h3>
            <ul className="space-y-3 text-white/90">
              <li><Link href="/missions" className="hover:text-[#F0E68C] transition">Trouver une mission</Link></li>
              <li><Link href="/formations" className="hover:text-[#F0E68C] transition">Formations gratuites</Link></li>
              <li><Link href="/profil" className="hover:text-[#F0E68C] transition">Mon profil</Link></li>
              <li><Link href="/#testimonials" className="hover:text-[#F0E68C] transition">Témoignages</Link></li>
            </ul>
          </div>

          {/* Colonne 3 – Entreprises */}
          <div>
            <h3 className="text-[#F0E68C] font-bold text-lg mb-5">Entreprises</h3>
            <ul className="space-y-3 text-white/90">
              <li><Link href="/entreprises" className="hover:text-[#F0E68C] transition">Poster une mission</Link></li>
              <li><Link href="/recrutement" className="hover:text-[#F0E68C] transition">Trouver des talents</Link></li>
              <li><Link href="/tarifs" className="hover:text-[#F0E68C] transition">Tarifs</Link></li>
              <li><Link href="/contact" className="hover:text-[#F0E68C] transition">Nous contacter</Link></li>
            </ul>
          </div>

          {/* Colonne 4 – Contact */}
          <div>
            <h3 className="text-[#F0E68C] font-bold text-lg mb-5">Contact</h3>
            <ul className="space-y-4 text-white/90">
              <li className="flex items-center gap-3"><Mail className="w-5 h-5" /> contact@jobsy.bj</li>
              <li className="flex items-center gap-3"><Phone className="w-5 h-5" /> +229 67 00 00 00</li>
              <li className="flex items-center gap-3"><MapPin className="w-5 h-5" /> Cotonou, Fidjrossè</li>
            </ul>
            <div className="flex gap-4 mt-8">
              <a href="#" className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center hover:bg-[#F0E68C] hover:text-[#000080] transition"><Facebook className="w-6 h-6" /></a>
              <a href="#" className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center hover:bg-[#F0E68C] hover:text-[#000080] transition"><Instagram className="w-6 h-6" /></a>
              <a href="#" className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center hover:bg-[#F0E68C] hover:text-[#000080] transition"><Linkedin className="w-6 h-6" /></a>
            </div>
          </div>
        </div>

        {/* Ligne légale commune */}
        <div className="border-t border-white/20 mt-16 pt-8 text-center text-sm text-white/60 space-x-6">
          <Link href="/cgu" className="hover:text-[#F0E68C] transition">CGU</Link>
          <Link href="/confidentialite" className="hover:text-[#F0E68C] transition">Confidentialité</Link>
          <Link href="/mentions" className="hover:text-[#F0E68C] transition">Mentions légales</Link>
        </div>
      </div>
    </footer>
  );
}