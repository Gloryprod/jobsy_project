<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; line-height: 1.6; }
        .header { text-align: center; color: #000080; }
        .section { margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>CONTRAT DE TRAVAIL - JOBSY</h1>
    </div>

    <div class="section">
        <p>Le présent contrat est établi entre :</p>
        <p><strong>L'Employeur :</strong> {{ $entreprise_nom }}</p>
        <p><strong>L'Employé :</strong> {{ $candidat_nom }}</p>
    </div>

    <div class="section">
        <p><strong>Poste :</strong> {{ $poste_titre }}</p>
        <p><strong>Rémunération :</strong> {{ $salaire }} F CFA</p>
    </div>

    <p style="margin-top: 50px;">Fait à Calavi, le {{ $date }}</p>
</body>
</html>