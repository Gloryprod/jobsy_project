@component('mail::message')
# Félicitations {{ $candidat->user->prenom }} ! 🎉

Vous avez brillamment réussi l'évaluation pour la formation **{{ $course->title }}** !

@component('mail::panel')
**Récapitulatif de vos performances :**
* **Score global :** {{ $enrollment->global_score }} points
* **Points XP gagnés :** +{{ $course->reward_xp }} XP
* **Statut :** Certifié
@endcomponent

Vos nouvelles compétences ont été automatiquement ajoutées à votre profil **Jobsy** pour maximiser votre visibilité auprès des recuteurs.

@if($enrollment->certificate_hash)
@component('mail::button', ['url' => config('app.url') . '/certificates/' . $enrollment->certificate_hash, 'color' => 'primary'])
Voir mon certificat
@endcomponent
@endif

Continuez sur cette lancée pour faire évoluer votre rang !

Cordialement,<br>
L'équipe **{{ config('app.name') }}**
@endcomponent