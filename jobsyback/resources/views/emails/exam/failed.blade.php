@component('mail::message')
# Bonjour {{ $candidat->user->prenom }},

Vos résultats pour la formation **{{ $course->title }}** sont désormais disponibles.

Malheureusement, votre score actuel ne vous permet pas de valider cette certification pour le moment.

@component('mail::panel')
**Vos résultats :**
* **Score obtenu :** {{ $enrollment->global_score }} points
* **Statut :** Non validé
@endcomponent

Ne vous découragez pas ! L'apprentissage est un processus continu. Prenez le temps de revoir les modules de la formation et tentez à nouveau votre chance.

@component('mail::button', ['url' => config('app.url') . '/courses/' . $course->id, 'color' => 'subtle'])
Revoir la formation
@endcomponent

Nous restons à vos côtés pour vous accompagner vers la réussite.

Cordialement,<br>
L'équipe **{{ config('app.name') }}**
@endcomponent