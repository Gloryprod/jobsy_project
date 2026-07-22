<!-- <!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Certificat Officiel Jobsy</title>
    <style>
        @page { margin: 0; }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact;
        }
        .certificate-container {
            width: 297mm;
            height: 210mm;
            box-sizing: border-box;
            padding: 40px;
            position: relative;
            background-image: radial-gradient(circle at top right, #eff6ff 0%, transparent 40%);
        }
        .border-decor {
            position: absolute;
            top: 20px; bottom: 20px; left: 20px; right: 20px;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            pointer-events: none;
        }
        .header {
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 20px;
        }
        .logo {
            font-size: 24px;
            font-weight: 900;
            color: #000080;
            letter-spacing: -1px;
        }
        .logo-dot { color: #3b82f6; }
        .subtitle {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #94a3b8;
            font-weight: bold;
            margin-top: 5px;
        }
        .content {
            text-align: center;
            margin-top: 80px;
        }
        .intro-text {
            font-style: italic;
            color: #94a3b8;
            font-size: 14px;
        }
        .recipient-name {
            font-size: 32px;
            font-weight: 800;
            color: #0f172a;
            margin: 20px 0;
            text-transform: capitalize;
        }
        .course-title {
            font-size: 26px;
            font-weight: 900;
            color: #000080;
            margin: 15px 0;
            text-transform: uppercase;
        }
        .divider {
            width: 80px;
            height: 3px;
            background-color: #000080;
            margin: 20px auto;
            border-radius: 2px;
        }
        .footer {
            position: absolute;
            bottom: 60px;
            left: 40px;
            right: 40px;
        }
        .signature-block { float: left; }
        .hash-block { float: right; text-align: right; }
        .label {
            font-size: 9px;
            text-transform: uppercase;
            color: #94a3b8;
            font-weight: bold;
            letter-spacing: 1px;
        }
        .value {
            font-size: 12px;
            font-weight: bold;
            color: #334155;
            margin-top: 5px;
        }
        .hash-value {
            font-family: monospace;
            font-size: 11px;
            color: #475569;
        }
    </style>
</head>
<body>

    <div class="certificate-container">
        <div class="border-decor"></div>

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

        <div class="footer">
            <div class="signature-block">
                <div class="label">Autorité de délivrance</div>
                <div class="value">Le Comité Pédagogique Jobsy</div>
                <div class="value" style="font-size: 10px; color: #94a3b8; font-weight: normal; margin-top: 2px;">Fait le {{ $date }}</div>
            </div>
            
            <div class="hash-block">
                <div class="label">ID de vérification unique</div>
                <div class="value hash-value">{{ $hash }}</div>
            </div>
        </div>
    </div>

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
</html>