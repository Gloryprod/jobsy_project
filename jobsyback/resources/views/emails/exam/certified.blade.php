@component('mail::message')
# Félicitations {{ $candidatName }} ! 🎉

Vous avez brillamment réussi l'évaluation pour la formation **{{ $courseTitle }}** !

@component('mail::panel')
**Récapitulatif de vos performances :**
* **Score global :** {{ $score }} / 100
* **Points XP gagnés :** +{{ $rewardXp }} XP
* **Statut :** Certifié
@endcomponent

Vos nouvelles compétences ont été automatiquement ajoutées à votre profil **Jobsy** pour maximiser votre visibilité auprès des recruteurs.

@if($certHash)
@component('mail::button', ['url' => $certUrl, 'color' => 'primary'])
Voir mon certificat
@endcomponent
@endif

Continuez sur cette lancée pour faire évoluer votre rang !

Cordialement,<br>
L'équipe **{{ config('app.name') }}**
@endcomponent
