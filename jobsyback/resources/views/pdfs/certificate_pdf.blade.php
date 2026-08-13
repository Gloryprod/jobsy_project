<!-- <!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Certificat Officiel Jobsy</title>
    <style>
        /* 1. Reset strict pour bloquer les sauts de page de DomPDF */
        @page { 
            margin: 0; 
            size: a4 landscape;
        }
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #ffffff;
            font-family: 'Helvetica', 'Arial', sans-serif;
            -webkit-text-size-adjust: none;
        }
        
        /* Empêcher tout saut de page interne */
        table, tr, td, div {
            page-break-inside: avoid;
            page-break-before: avoid;
            page-break-after: avoid;
        }

        /* 2. Tableau principal fluide (Pas de hauteur fixe en mm pour éviter le débordement) */
        .certificate-table {
            width: 100%;
            height: 100%;
            border-collapse: collapse;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
        }

        .certificate-cell {
            padding: 30px; /* Réduit pour donner de l'air à DomPDF */
            vertical-align: middle;
        }

        /* Cadre décoratif interne */
        .inner-border {
            border: 2px solid #e2e8f0;
            border-radius: 16px;
            padding: 30px;
            box-sizing: border-box;
        }

        /* En-tête */
        .header {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 15px;
            margin-bottom: 30px;
        }
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #000080;
        }
        .logo-dot { color: #3b82f6; }
        
        .subtitle {
            font-size: 10px;
            text-transform: uppercase;
            color: #94a3b8;
            font-weight: bold;
            margin-top: 5px;
        }

        /* Corps central */
        .content {
            text-align: center;
            margin-bottom: 40px;
        }

        .intro-text {
            font-style: italic;
            color: #64748b;
            font-size: 15px;
            margin-bottom: 10px;
        }

        .recipient-name {
            font-size: 34px;
            font-weight: bold;
            color: #0f172a;
            margin: 15px 0;
        }

        .course-title {
            font-size: 26px;
            font-weight: bold;
            color: #000080;
            margin: 15px 0;
        }

        .divider {
            width: 80px;
            height: 3px;
            background-color: #000080;
            margin: 15px auto;
        }

        /* Zone Footer */
        .footer-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        .footer-cell {
            width: 50%;
            vertical-align: bottom;
        }

        .label {
            font-size: 9px;
            text-transform: uppercase;
            color: #94a3b8;
            font-weight: bold;
        }

        .value {
            font-size: 12px;
            font-weight: bold;
            color: #334155;
            margin-top: 5px;
        }

        .hash-value {
            font-family: monospace;
            font-size: 10px;
            color: #475569;
        }
    </style>
</head>
<body>

    <table class="certificate-table">
        <tr>
            <td class="certificate-cell">
                
                <div class="inner-border">
                    
                    <div class="header">
                        <div class="logo">JOBSY<span class="logo-dot">.</span></div>
                        <div class="subtitle">Certification Officielle de Compétences</div>
                    </div>

                    <div class="content">
                        <div class="intro-text">Ce certificat d'excellence est décerné à</div>
                        <div class="recipient-name">{{ $name }}</div>
                        <div class="intro-text">pour avoir accompli avec succès et validé l'examen final du parcours :</div>
                        <div class="course-title">{{ $courseTitle }}</div>
                        <div class="divider"></div>
                    </div>

                    <table class="footer-table">
                        <tr>
                            <td class="footer-cell" style="text-align: left;">
                                <div class="label">Autorité de délivrance</div>
                                <div class="value">Le Comité Pédagogique Jobsy</div>
                                <div class="value" style="font-size: 11px; color: #94a3b8; font-weight: normal; margin-top: 2px;">Fait le {{ $date }}</div>
                            </td>
                            <td class="footer-cell" style="text-align: right;">
                                <div class="label">ID de vérification unique</div>
                                <div class="value hash-value">{{ $hash }}</div>
                            </td>
                        </tr>
                    </table>

                </div>

            </td>
        </tr>
    </table>

</body>
</html> -->

<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Certificat Officiel Jobsy</title>
    <style>
        /* 1. Reset strict pour bloquer les sauts de page de DomPDF */
        @page { 
            margin: 0; 
            size: a4 landscape;
        }
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #ffffff;
            font-family: 'Helvetica', 'Arial', sans-serif;
            -webkit-text-size-adjust: none;
        }
        
        /* Empêcher tout saut de page interne */
        table, tr, td, div {
            page-break-inside: avoid;
            page-break-before: avoid;
            page-break-after: avoid;
        }

        /* 2. Tableau principal fluide (Pas de hauteur fixe en mm pour éviter le débordement) */
        .certificate-table {
            width: 100%;
            height: 100%;
            border-collapse: collapse;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
        }

        .certificate-cell {
            padding: 30px; /* Réduit pour donner de l'air à DomPDF */
            vertical-align: middle;
        }

        /* Cadre décoratif interne */
        .inner-border {
            border: 2px solid #e2e8f0;
            border-radius: 16px;
            padding: 30px;
            box-sizing: border-box;
        }

        /* En-tête */
        .header {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 15px;
            margin-bottom: 25px;
        }
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #000080;
        }
        .logo-dot { color: #3b82f6; }
        
        .subtitle {
            font-size: 10px;
            text-transform: uppercase;
            color: #94a3b8;
            font-weight: bold;
            margin-top: 5px;
        }

        /* Corps central */
        .content {
            text-align: center;
            margin-bottom: 30px;
        }

        .intro-text {
            font-style: italic;
            color: #64748b;
            font-size: 15px;
            margin-bottom: 10px;
        }

        .recipient-name {
            font-size: 34px;
            font-weight: bold;
            color: #0f172a;
            margin: 10px 0;
        }

        .course-title {
            font-size: 24px;
            font-weight: bold;
            color: #000080;
            margin: 10px 0;
        }

        .divider {
            width: 80px;
            height: 3px;
            background-color: #000080;
            margin: 15px auto;
        }

        /* Style pour le Badge */
        .badge-pill {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
        }

        /* Style pour la liste des compétences */
        .skills-container {
            margin-top: 15px;
        }

        .skills-label {
            font-size: 10px;
            text-transform: uppercase;
            color: #94a3b8;
            font-weight: bold;
            margin-bottom: 6px;
        }

        .skill-tag {
            display: inline-block;
            background-color: #e2e8f0;
            color: #334155;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            margin: 2px 3px;
        }

        /* Zone Footer */
        .footer-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        .footer-cell {
            width: 50%;
            vertical-align: bottom;
        }

        .label {
            font-size: 9px;
            text-transform: uppercase;
            color: #94a3b8;
            font-weight: bold;
        }

        .value {
            font-size: 12px;
            font-weight: bold;
            color: #334155;
            margin-top: 5px;
        }

        .hash-value {
            font-family: monospace;
            font-size: 10px;
            color: #475569;
        }
    </style>
</head>
<body>

    <table class="certificate-table">
        <tr>
            <td class="certificate-cell">
                
                <div class="inner-border">
                    
                    <div class="header">
                        <div class="logo">JOBSY<span class="logo-dot">.</span></div>
                        <div class="subtitle">Certification Officielle de Compétences</div>
                    </div>

                    <div class="content">
                        <!-- Affichage du Badge si présent -->
                        @if(!empty($badgeDetails))
                            <div class="badge-pill" style="background-color: {{ $badgeDetails['bg'] ?? '#f3f4f6' }}; color: {{ $badgeDetails['color'] ?? '#334155' }}; border: 1px solid {{ $badgeDetails['color'] ?? '#cbd5e1' }};">
                                {{ $badgeDetails['label'] ?? $badge }}
                            </div>
                        @endif

                        <div class="intro-text">Ce certificat d'excellence est décerné à</div>
                        <div class="recipient-name">{{ $name }}</div>
                        <div class="intro-text">pour avoir accompli avec succès et validé l'examen final du parcours :</div>
                        <div class="course-title">{{ $courseTitle }}</div>

                        <!-- Affichage des Compétences si présentes -->
                        @if(!empty($skills) && is_array($skills))
                            <div class="skills-container">
                                <div class="skills-label">Compétences validées</div>
                                @foreach($skills as $skill)
                                    <span class="skill-tag">
                                        {{ is_array($skill) ? ($skill['name'] ?? $skill['label'] ?? '') : $skill }}
                                    </span>
                                @endforeach
                            </div>
                        @endif

                        <div class="divider"></div>
                    </div>

                    <table class="footer-table">
                        <tr>
                            <td class="footer-cell" style="text-align: left;">
                                <div class="label">Autorité de délivrance</div>
                                <div class="value">Le Comité Pédagogique Jobsy</div>
                                <div class="value" style="font-size: 11px; color: #94a3b8; font-weight: normal; margin-top: 2px;">Fait le {{ $date }}</div>
                            </td>
                            <td class="footer-cell" style="text-align: right;">
                                <div class="label">ID de vérification unique</div>
                                <div class="value hash-value">{{ $hash }}</div>
                            </td>
                        </tr>
                    </table>

                </div>

            </td>
        </tr>
    </table>

</body>
</html>