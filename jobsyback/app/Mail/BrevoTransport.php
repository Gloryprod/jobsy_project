<?php

namespace App\Mail;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Symfony\Component\Mailer\Exception\TransportException;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\MessageConverter;

/**
 * Envoi des e-mails par l'API HTTP de Brevo (port 443), activé par MAIL_MAILER=brevo et BREVO_API_KEY.
 * Les offres gratuites de Render bloquent les ports SMTP (25, 465, 587) : une API en HTTPS passe.
 */
class BrevoTransport extends AbstractTransport
{
    public const URL = 'https://api.brevo.com/v3/smtp/email';

    public function __construct(private string $cle, private int $delai = 15)
    {
        parent::__construct();
    }

    protected function doSend(SentMessage $message): void
    {
        if ($this->cle === '') {
            throw new TransportException("BREVO_API_KEY n'est pas renseignée : aucun e-mail ne peut partir.");
        }

        $email = MessageConverter::toEmail($message->getOriginalMessage());
        $adresse = fn (Address $a) => array_filter(['email' => $a->getAddress(), 'name' => $a->getName() ?: null]);
        $expediteur = $email->getFrom()[0] ?? $message->getEnvelope()->getSender();

        $html = $this->contenu($email->getHtmlBody());
        $texte = $this->contenu($email->getTextBody());

        $corps = array_filter([
            'sender' => $adresse($expediteur),
            'to' => array_map($adresse, $email->getTo()),
            'cc' => array_map($adresse, $email->getCc()),
            'bcc' => array_map($adresse, $email->getBcc()),
            'replyTo' => isset($email->getReplyTo()[0]) ? $adresse($email->getReplyTo()[0]) : null,
            'subject' => (string) $email->getSubject(),
            // Brevo exige un contenu HTML : un message en texte seul est mis en forme simplement
            'htmlContent' => $html ?? nl2br(e((string) $texte)),
            'textContent' => $texte,
            'attachment' => array_map(fn ($piece) => [
                'name' => $piece->getFilename() ?? 'piece-jointe',
                'content' => base64_encode($piece->getBody()),
            ], $email->getAttachments()),
        ], fn ($valeur) => $valeur !== null && $valeur !== []);

        try {
            $reponse = Http::withHeaders(['api-key' => $this->cle, 'accept' => 'application/json'])
                ->timeout($this->delai)
                ->post(self::URL, $corps);
        } catch (ConnectionException $e) {
            throw new TransportException("Brevo ne répond pas : {$e->getMessage()}", 0, $e);
        }

        if ($reponse->failed()) {
            throw new TransportException("Brevo a refusé l'envoi (HTTP {$reponse->status()}) : " . $reponse->json('message', $reponse->body()));
        }

        if ($identifiant = $reponse->json('messageId')) {
            $message->setMessageId($identifiant);
        }
    }

    /** Corps HTML ou texte : Symfony peut le fournir en flux. */
    private function contenu(mixed $corps): ?string
    {
        if (is_resource($corps)) {
            $corps = stream_get_contents($corps);
        }

        return is_string($corps) && $corps !== '' ? $corps : null;
    }

    public function __toString(): string
    {
        return 'brevo+api://api.brevo.com';
    }
}
