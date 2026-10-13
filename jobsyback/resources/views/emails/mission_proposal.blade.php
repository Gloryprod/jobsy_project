<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proposition de mission</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: none;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
        }
        .header {
            background-color: #0f172a;
            padding: 30px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        .header span {
            color: #6366f1;
        }
        .content {
            padding: 32px 28px;
        }
        .badge {
            display: inline-block;
            background-color: #e0e7ff;
            color: #4338ca;
            font-size: 11px;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 16px;
        }
        .greeting {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 12px;
        }
        .message-box {
            background-color: #f1f5f9;
            border-left: 4px solid #6366f1;
            padding: 16px 20px;
            border-radius: 8px;
            font-size: 14px;
            line-height: 1.6;
            color: #334155;
            white-space: pre-line;
            margin: 20px 0;
        }
        .mission-card {
            background-color: #faf5ff;
            border: 1px solid #f3e8ff;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
        }
        .mission-title {
            font-size: 15px;
            font-weight: 700;
            color: #581c87;
            margin: 0 0 6px 0;
        }
        .mission-company {
            font-size: 13px;
            color: #7e22ce;
            margin: 0;
        }
        .actions {
            text-align: center;
            margin-top: 32px;
            margin-bottom: 12px;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.2s ease;
            margin: 6px;
        }
        .btn-accept {
            background-color: #4f46e5;
            color: #ffffff !important;
            box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
        }
        .btn-decline {
            background-color: #f1f5f9;
            color: #64748b !important;
            border: 1px solid #cbd5e1;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>JOBSY<span>.</span></h1>
        </div>

        <!-- Corps -->
        <div class="content">
            <span class="badge">Opportunité de mission</span>

            <p class="greeting">Bonjour {{ $candidat->nom }} {{ $candidat->prenom }},</p>

            <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                L'entreprise <strong>{{ $entreprise->nom_entreprise ?? $entreprise->name }}</strong> a repéré votre profil sur Jobsy et souhaite vous proposer directement une offre de mission :
            </p>

            <!-- Card recap mission -->
            <div class="mission-card">
                <p class="mission-title">📌 {{ $mission->title }}</p>
                <p class="mission-company">Proposé par {{ $entreprise->nom_entreprise ?? $entreprise->name }}</p>
            </div>

            <!-- Message personnalisé de l'entreprise -->
            <div class="message-box">
                {{ $messageBody }}
            </div>

            <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 24px;">
                Souhaitez-vous accepter cette proposition de mission ?
            </p>

            <!-- Boutons d'action -->
            <div class="actions">
                <a href="{{ $acceptUrl }}" class="btn btn-accept">
                    ✓ Accepter la proposition
                </a>
                <a href="{{ $declineUrl }}" class="btn btn-decline">
                    Décliner
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Cet e-mail a été envoyé via la plateforme Jobsy.</p>
            <p>Si vous avez des questions, n'hésitez pas à nous contacter sur support@jobsy.com.</p>
        </div>
    </div>
</body>
</html>