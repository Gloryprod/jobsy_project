@component('mail::message')
# Bonjour {{ $candidatName }},

Vos résultats pour la formation **{{ $courseTitle }}** sont désormais disponibles.

Malheureusement, votre score actuel ne vous permet pas de valider cette certification pour le moment.

@component('mail::panel')
**Vos résultats :**
* **Score obtenu :** {{ $score }} / 100
* **Statut :** Non validé
@endcomponent

Ne vous découragez pas ! L'apprentissage est un processus continu. Prenez le temps de revoir les modules de la formation et tentez à nouveau votre chance.

@component('mail::button', ['url' => $retryUrl, 'color' => 'subtle'])
Revoir la formation
@endcomponent

Nous restons à vos côtés pour vous accompagner vers la réussite.

Cordialement,<br>
L'équipe **{{ config('app.name') }}**
@endcomponent
